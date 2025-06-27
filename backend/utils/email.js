import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use your SMTP provider
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS  // your app password or real password
    }
});

// Enhanced email function with HTML support
export const sendEmail = async (to, subject, text, html = null) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        ...(html && { html })
    };
    await transporter.sendMail(mailOptions);
};

// Email templates for different booking scenarios
export const emailTemplates = {
    // Booking confirmation email for guest
    bookingConfirmation: (booking, guest, host) => ({
        subject: `✅ Booking Confirmed - ${booking.listing.title}`,
        text: `
Hi ${guest.name},

Great news! Your booking has been confirmed.

Booking Details:
- Property: ${booking.listing.title}
- Location: ${booking.listing.location}
- Check-in: ${new Date(booking.startDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
- Check-out: ${new Date(booking.endDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
- Duration: ${Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} nights
- Total Amount: ₹${booking.price?.toLocaleString()}
- Booking ID: ${booking._id}

Host Contact Information:
- Name: ${host.name}
- Email: ${host.email}

Important Information:
- Please arrive at the property after 2:00 PM on your check-in date
- Check-out time is 11:00 AM
- Bring a valid government-issued ID for verification
- Contact your host if you need any assistance

Need help? Contact our support team at support@boulevard.com

Safe travels!
The Boulevard Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .amount { font-size: 24px; font-weight: bold; color: #10b981; }
        .host-info { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .important { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .success-icon { color: #10b981; font-size: 48px; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Booking Confirmed!</h1>
            <p>Your reservation at ${booking.listing.title} is confirmed</p>
        </div>
        
        <div class="content">
            <div class="success-icon">✅</div>
            
            <p>Hi <strong>${guest.name}</strong>,</p>
            <p>Great news! Your booking has been confirmed and you're all set for your upcoming stay.</p>
            
            <div class="booking-card">
                <h3 style="margin-top: 0; color: #10b981;">📍 ${booking.listing.title}</h3>
                <p style="color: #666; margin-bottom: 20px;">${booking.listing.location}</p>
                
                <div class="detail-row">
                    <span class="label">📅 Check-in:</span>
                    <span class="value">${new Date(booking.startDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">📅 Check-out:</span>
                    <span class="value">${new Date(booking.endDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">🌙 Duration:</span>
                    <span class="value">${Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} nights</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">🆔 Booking ID:</span>
                    <span class="value">${booking._id}</span>
                </div>
                
                <div class="detail-row" style="border-top: 2px solid #10b981; padding-top: 15px; margin-top: 15px;">
                    <span class="label">💰 Total Amount:</span>
                    <span class="amount">₹${booking.price?.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="host-info">
                <h4 style="margin-top: 0; color: #0369a1;">👤 Your Host</h4>
                <p><strong>Name:</strong> ${host.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${host.email}">${host.email}</a></p>
                <p style="margin-bottom: 0;"><em>Feel free to reach out if you have any questions about your stay!</em></p>
            </div>
            
            <div class="important">
                <h4 style="margin-top: 0; color: #d97706;">⚠️ Important Information</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Check-in time: <strong>After 2:00 PM</strong></li>
                    <li>Check-out time: <strong>Before 11:00 AM</strong></li>
                    <li>Bring a <strong>valid government-issued ID</strong> for verification</li>
                    <li>Contact your host 24 hours before arrival to confirm details</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p>Need assistance? Our support team is here to help!</p>
                <p><strong>📧 support@boulevard.com</strong> | <strong>📞 +91-9876543210</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p>Safe travels! 🌟<br>
            <strong>The Boulevard Team</strong></p>
            <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // New booking notification for host
    newBookingHost: (booking, guest, host) => ({
        subject: `🔔 New Booking Received - ${booking.listing.title}`,
        text: `
Hi ${host.name},

You have received a new booking for your property!

Booking Details:
- Property: ${booking.listing.title}
- Guest: ${guest.name} (${guest.email})
- Check-in: ${new Date(booking.startDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
- Check-out: ${new Date(booking.endDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
- Duration: ${Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} nights
- Revenue: ₹${booking.price?.toLocaleString()}
- Booking ID: ${booking._id}

Next Steps:
1. Login to your EcoNest dashboard to view full booking details
2. Prepare your property for the guest's arrival
3. Contact the guest if needed: ${guest.email}

Manage your bookings: https://boulevard.com/owner-bookings

Thank you for hosting with Boulevard!
The Boulevard Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .guest-info { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .action-steps { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .new-booking-icon { color: #059669; font-size: 48px; text-align: center; margin: 20px 0; }
        .cta-button { background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 New Booking Received!</h1>
            <p>Someone just booked your property: ${booking.listing.title}</p>
        </div>
        
        <div class="content">
            <div class="new-booking-icon">🔔</div>
            
            <p>Hi <strong>${host.name}</strong>,</p>
            <p>Great news! You have received a new booking for your property. Here are the details:</p>
            
            <div class="booking-card">
                <h3 style="margin-top: 0; color: #059669;">📍 ${booking.listing.title}</h3>
                
                <div class="detail-row">
                    <span class="label">📅 Check-in:</span>
                    <span class="value">${new Date(booking.startDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">📅 Check-out:</span>
                    <span class="value">${new Date(booking.endDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">🌙 Duration:</span>
                    <span class="value">${Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} nights</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">🆔 Booking ID:</span>
                    <span class="value">${booking._id}</span>
                </div>
                
                <div class="detail-row" style="border-top: 2px solid #059669; padding-top: 15px; margin-top: 15px;">
                    <span class="label">💰 Revenue:</span>
                    <span class="amount">₹${booking.price?.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="guest-info">
                <h4 style="margin-top: 0; color: #1e40af;">👤 Guest Information</h4>
                <p><strong>Name:</strong> ${guest.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${guest.email}">${guest.email}</a></p>
                <p style="margin-bottom: 0;"><em>Feel free to reach out to welcome your guest!</em></p>
            </div>
            
            <div class="action-steps">
                <h4 style="margin-top: 0; color: #d97706;">📋 Next Steps</h4>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>Login to your EcoNest dashboard to view full details</li>
                    <li>Prepare your property for the guest's arrival</li>
                    <li>Contact the guest if you need any additional information</li>
                    <li>Ensure the property is ready for check-in after 2:00 PM</li>
                </ol>
            </div>
            
            <div style="text-align: center;">
                <a href="https://boulevard.com/owner-bookings" class="cta-button">Manage Bookings</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for hosting with Boulevard! 🌟<br>
            <strong>The Boulevard Team</strong></p>
            <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // Booking cancellation email for guest
    bookingCancellation: (booking, guest, refundInfo = null) => ({
        subject: `❌ Booking Cancelled - ${booking.listing.title}`,
        text: `
Hi ${guest.name},

Your booking has been cancelled as requested.

Cancelled Booking Details:
- Property: ${booking.listing.title}
- Location: ${booking.listing.location}
- Original Check-in: ${new Date(booking.startDate).toLocaleDateString('en-GB')}
- Original Check-out: ${new Date(booking.endDate).toLocaleDateString('en-GB')}
- Booking ID: ${booking._id}
${refundInfo ? `\nRefund Information:\n${refundInfo}` : '\nNo refund applicable for this booking.'}

If you have any questions about this cancellation, please contact our support team.

Support: support@boulevard.com

We hope to serve you again in the future!
The Boulevard Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .refund-info { background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .cancel-icon { color: #dc2626; font-size: 48px; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Booking Cancelled</h1>
            <p>Your reservation has been cancelled</p>
        </div>
        
        <div class="content">
            <div class="cancel-icon">❌</div>
            
            <p>Hi <strong>${guest.name}</strong>,</p>
            <p>Your booking has been successfully cancelled as requested.</p>
            
            <div class="booking-card">
                <h3 style="margin-top: 0; color: #dc2626;">📍 ${booking.listing.title}</h3>
                <p style="color: #666; margin-bottom: 20px;">${booking.listing.location}</p>
                
                <div class="detail-row">
                    <span class="label">📅 Original Check-in:</span>
                    <span class="value">${new Date(booking.startDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">📅 Original Check-out:</span>
                    <span class="value">${new Date(booking.endDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">🆔 Booking ID:</span>
                    <span class="value">${booking._id}</span>
                </div>
            </div>
            
            ${refundInfo ? `
            <div class="refund-info">
                <h4 style="margin-top: 0; color: #16a34a;">💰 Refund Information</h4>
                <p style="margin-bottom: 0;">${refundInfo}</p>
            </div>
            ` : `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0;"><strong>Note:</strong> No refund is applicable for this booking based on the cancellation policy.</p>
            </div>
            `}
        </div>
        
        <div class="footer">
            <p>Questions? Contact us at <strong>support@boulevard.com</strong></p>
            <p>We hope to serve you again in the future! 🌟<br>
            <strong>The Boulevard Team</strong></p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // Booking cancellation notification for host
    bookingCancellationHost: (booking, guest, host, refundInfo = null) => ({
        subject: `📢 Guest Cancelled Booking - ${booking.listing.title}`,
        text: `
Hi ${host.name},

A guest has cancelled their booking for your property.

Cancelled Booking Details:
- Property: ${booking.listing.title}
- Guest: ${guest.name} (${guest.email})
- Original Check-in: ${new Date(booking.startDate).toLocaleDateString('en-GB')}
- Original Check-out: ${new Date(booking.endDate).toLocaleDateString('en-GB')}
- Booking ID: ${booking._id}
${refundInfo ? `\nRefund processed: ${refundInfo}` : ''}

Your property is now available for these dates again and can accept new bookings.

Manage your listings: https://boulevard.com/listings

Thank you for hosting with Boulevard!
The Boulevard Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ea580c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .availability-note { background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .notification-icon { color: #ea580c; font-size: 48px; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📢 Booking Cancellation</h1>
            <p>A guest has cancelled their booking</p>
        </div>
        
        <div class="content">
            <div class="notification-icon">📋</div>
            
            <p>Hi <strong>${host.name}</strong>,</p>
            <p>A guest has cancelled their booking for your property. Here are the details:</p>
            
            <div class="booking-card">
                <h3 style="margin-top: 0; color: #ea580c;">📍 ${booking.listing.title}</h3>
                
                <div class="detail-row">
                    <span class="label">👤 Guest:</span>
                    <span class="value">${guest.name}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">📧 Email:</span>
                    <span class="value">${guest.email}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">📅 Original Check-in:</span>
                    <span class="value">${new Date(booking.startDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">📅 Original Check-out:</span>
                    <span class="value">${new Date(booking.endDate).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">🆔 Booking ID:</span>
                    <span class="value">${booking._id}</span>
                </div>
            </div>
            
            <div class="availability-note">
                <h4 style="margin-top: 0; color: #16a34a;">✅ Good News!</h4>
                <p style="margin-bottom: 0;">Your property is now available for these dates again and can accept new bookings.</p>
            </div>
            
            ${refundInfo ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0;"><strong>Refund processed:</strong> ${refundInfo}</p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p><a href="https://boulevard.com/listings" style="color: #059669;">Manage Your Listings</a></p>
            <p>Thank you for hosting with Boulevard! 🌟<br>
            <strong>The Boulevard Team</strong></p>
        </div>
    </div>
</body>
</html>
        `
    })
};