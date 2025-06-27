import express from 'express';
import { sendEmail } from '../utils/email.js';
import Contact from '../models/contactModel.js';

const router = express.Router();

/**
 * @route   POST /api/contact/submit
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/submit', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate inputs
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ error: 'Please provide a valid email address' });
        }

        // Create and save contact form submission
        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });

        await newContact.save();
        console.log(`Contact form submission saved: ${newContact._id}`);

        // Prepare email to admin
        const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2e7d32; text-align: center;">New Contact Form Submission</h2>
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
        <p style="text-align: center; color: #757575; font-size: 14px;">
          This message was submitted through the Boulevard contact form.
        </p>
      </div>
    `;

        // Prepare confirmation email to user
        const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2e7d32; text-align: center;">Thank You for Contacting Boulevard</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible. Below is a copy of your submission for your records:</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
        
        <p>If you have any additional questions or information to provide, please reply to this email.</p>
        <p>Best regards,</p>
        <p>The Boulevard Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #757575; font-size: 14px;">
          <p>Boulevard - Eco-friendly accommodations across India</p>
        </div>
      </div>
    `;

        // Send email to admin
        await sendEmail(
            process.env.ADMIN_EMAIL || 'admin@boulevard.com',
            `Contact Form: ${subject}`,
            `New contact from ${name} (${email}): ${message}`,
            adminEmailHtml
        );

        // Send confirmation email to user
        await sendEmail(
            email,
            'Thank You for Contacting Boulevard',
            `Dear ${name}, we have received your message and will get back to you as soon as possible.`,
            userEmailHtml
        );

        res.status(200).json({ message: 'Your message has been sent successfully!', id: newContact._id });
    } catch (err) {
        console.error('Contact form error:', err);
        next(err);
    }
});

/**
 * @route   GET /api/contact/admin
 * @desc    Get all contact form submissions (admin only)
 * @access  Private/Admin
 */
router.get('/admin', async (req, res, next) => {
    try {
        // TODO: Add admin middleware
        const contacts = await Contact.find({}).sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   PUT /api/contact/admin/:id
 * @desc    Update contact submission status (admin only)
 * @access  Private/Admin
 */
router.put('/admin/:id', async (req, res, next) => {
    try {
        // TODO: Add admin middleware
        const { status, notes, isRead } = req.body;

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact submission not found' });
        }

        if (status) contact.status = status;
        if (notes !== undefined) contact.notes = notes;
        if (isRead !== undefined) contact.isRead = isRead;

        await contact.save();

        res.status(200).json(contact);
    } catch (err) {
        next(err);
    }
});

export default router;
