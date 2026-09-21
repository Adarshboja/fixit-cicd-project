import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Complaint from '../src/models/Complaint.js';

let mongoServer;
let userToken;
let adminToken;
let secondUserToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret';
  await mongoose.connect(process.env.MONGODB_URI);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
  }

  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Jane User', email: 'jane@example.com', password: 'secret123' });

  userToken = userResponse.body.data.token;

  const secondUserResponse = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Second User', email: 'second@example.com', password: 'secret123' });

  secondUserToken = secondUserResponse.body.data.token;

  const adminResponse = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin User', email: 'admin@example.com', password: 'secret123' });

  await User.findOneAndUpdate({ email: 'admin@example.com' }, { role: 'ADMIN' });

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'secret123' });

  adminToken = loginResponse.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('FixIt API', () => {
  it('returns the health endpoint', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBe('FixIt API is running');
  });

  it('registers a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email: 'newuser@example.com', password: 'secret123' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('newuser@example.com');
  });

  it('logs in an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'secret123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
  });

  it('requires authentication to create a complaint', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .send({
        title: 'AC not working',
        description: 'The air conditioner is not cooling properly.',
        category: 'Electrical',
        priority: 'High',
        location: 'Office 2B',
      });

    expect(response.status).toBe(401);
  });

  it('allows an authenticated user to create a complaint', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Internet issue',
        description: 'Connection keeps dropping on the second floor.',
        category: 'Internet',
        priority: 'Medium',
        location: 'Second Floor',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Internet issue');
  });

  it('allows an admin to update complaint status', async () => {
    const created = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Plumbing issue',
        description: 'Bathroom sink is leaking.',
        category: 'Plumbing',
        priority: 'High',
        location: 'Bathroom 1',
      });

    const response = await request(app)
      .put(`/api/complaints/${created.body.data._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'In Progress' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('In Progress');
  });

  it('stores the complaint associated with the logged-in user', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Computer issue',
        description: 'Laptop keeps freezing while working.',
        category: 'Maintenance',
        priority: 'Low',
        location: 'Desk 4',
      });

    const savedComplaint = await Complaint.findById(response.body.data._id).lean();
    expect(savedComplaint.createdBy.toString()).toBeTruthy();
    expect(savedComplaint.status).toBe('Pending');
  });

  it('only returns complaints owned by a normal user', async () => {
    await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Private issue', description: 'Only Jane should see this.', category: 'Other', priority: 'Low', location: 'Desk 1' });

    const response = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${secondUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });

  it('rejects status updates from normal users', async () => {
    const created = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Protected status', description: 'Admin only workflow.', category: 'Other', priority: 'Medium', location: 'Desk 2' });

    const response = await request(app)
      .put(`/api/complaints/${created.body.data._id}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'In Progress' });

    expect(response.status).toBe(403);
  });

  it('rejects invalid status transitions', async () => {
    const created = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Transition issue', description: 'Cannot skip stages.', category: 'Other', priority: 'Medium', location: 'Desk 3' });

    const response = await request(app)
      .put(`/api/complaints/${created.body.data._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' });

    expect(response.status).toBe(400);
  });

  it('returns not found for an unknown complaint', async () => {
    const response = await request(app)
      .get('/api/complaints/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });

  it('updates the authenticated profile and changes its password', async () => {
    const profileResponse = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Jane Updated', email: 'jane.updated@example.com' });

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.data.name).toBe('Jane Updated');

    const passwordResponse = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ currentPassword: 'secret123', newPassword: 'newsecret123' });

    expect(passwordResponse.status).toBe(200);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane.updated@example.com', password: 'newsecret123' });

    expect(loginResponse.status).toBe(200);
  });

  it('allows admins to list users without password fields', async () => {
    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    expect(response.body.data[0].password).toBeUndefined();
  });
});
