import Complaint from '../models/Complaint.js';

export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, location } = req.body;

    if (!title || !description || !category || !priority || !location) {
      return res.status(400).json({ success: false, message: 'All complaint fields are required' });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      location,
      status: 'Pending',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { createdBy: req.user._id };
    const complaints = await Complaint.find(query).populate('createdBy', 'name email role').sort({ createdAt: -1 });

    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('createdBy', 'name email role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role !== 'ADMIN' && complaint.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not allowed to view this complaint' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const transitions = {
      Pending: ['In Progress'],
      'In Progress': ['Pending', 'Resolved'],
      Resolved: [],
    };

    if (!transitions[complaint.status].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status can only move to the next stage' });
    }

    complaint.status = status;
    await complaint.save();

    res.json({ success: true, message: 'Complaint status updated successfully', data: complaint });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role !== 'ADMIN' && complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this complaint' });
    }

    await complaint.deleteOne();
    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};
