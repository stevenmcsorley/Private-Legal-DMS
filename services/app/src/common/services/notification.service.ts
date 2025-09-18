import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LegalHold } from '../entities/legal-hold.entity';
import { LegalHoldCustodian } from '../entities/legal-hold-custodian.entity';
import { User } from '../entities/user.entity';

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface NotificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendLegalHoldNotice(
    custodian: LegalHoldCustodian & { custodian: User; legal_hold: LegalHold },
  ): Promise<NotificationResult> {
    try {
      const template = this.generateLegalHoldNoticeTemplate(custodian);
      
      // In a real implementation, this would use a service like SendGrid, AWS SES, etc.
      // For now, we'll just log the notification
      this.logger.log(`Sending legal hold notice to ${custodian.custodian.email}`, {
        custodian_id: custodian.custodian_id,
        legal_hold_id: custodian.legal_hold_id,
        subject: template.subject,
      });

      // Simulate email sending
      await this.simulateEmailSending(custodian.custodian.email, template);

      return {
        success: true,
        message: `Legal hold notice sent to ${custodian.custodian.email}`,
      };
    } catch (error) {
      this.logger.error('Failed to send legal hold notice', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkLegalHoldNotices(
    custodians: (LegalHoldCustodian & { custodian: User; legal_hold: LegalHold })[],
  ): Promise<{ success: number; failed: number; results: NotificationResult[] }> {
    const results: NotificationResult[] = [];
    let success = 0;
    let failed = 0;

    for (const custodian of custodians) {
      const result = await this.sendLegalHoldNotice(custodian);
      results.push(result);
      
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed, results };
  }

  async sendLegalHoldReleaseNotification(
    custodian: LegalHoldCustodian & { custodian: User; legal_hold: LegalHold },
  ): Promise<NotificationResult> {
    try {
      const template = this.generateLegalHoldReleaseTemplate(custodian);
      
      this.logger.log(`Sending legal hold release notice to ${custodian.custodian.email}`, {
        custodian_id: custodian.custodian_id,
        legal_hold_id: custodian.legal_hold_id,
        subject: template.subject,
      });

      await this.simulateEmailSending(custodian.custodian.email, template);

      return {
        success: true,
        message: `Legal hold release notice sent to ${custodian.custodian.email}`,
      };
    } catch (error) {
      this.logger.error('Failed to send legal hold release notice', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendComplianceReminder(
    custodian: LegalHoldCustodian & { custodian: User; legal_hold: LegalHold },
  ): Promise<NotificationResult> {
    try {
      const template = this.generateComplianceReminderTemplate(custodian);
      
      this.logger.log(`Sending compliance reminder to ${custodian.custodian.email}`, {
        custodian_id: custodian.custodian_id,
        legal_hold_id: custodian.legal_hold_id,
        subject: template.subject,
      });

      await this.simulateEmailSending(custodian.custodian.email, template);

      return {
        success: true,
        message: `Compliance reminder sent to ${custodian.custodian.email}`,
      };
    } catch (error) {
      this.logger.error('Failed to send compliance reminder', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private generateLegalHoldNoticeTemplate(
    custodian: LegalHoldCustodian & { custodian: User; legal_hold: LegalHold },
  ): EmailTemplate {
    const { legal_hold, custodian: user } = custodian;
    
    const subject = `Legal Hold Notice: ${legal_hold.name}`;
    
    const text = `
Dear ${user.display_name},

This is to notify you that a legal hold has been placed on documents and communications related to the following matter:

Legal Hold Name: ${legal_hold.name}
Description: ${legal_hold.description}
Reason: ${legal_hold.reason}
Type: ${legal_hold.type}

You are required to preserve all documents, electronic files, and communications related to this matter. This includes but is not limited to:
- Emails, text messages, and instant messages
- Documents, spreadsheets, presentations
- Electronic files on computers, mobile devices, and cloud storage
- Voicemails and recorded conversations

Please acknowledge receipt of this notice by logging into the legal document management system or by replying to this email.

${legal_hold.custodian_instructions || ''}

If you have any questions about this legal hold, please contact the legal team immediately.

Thank you for your cooperation.

Legal Department
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc3545; margin: 0;">⚖️ Legal Hold Notice</h2>
        </div>
        
        <p>Dear <strong>${user.display_name}</strong>,</p>
        
        <p>This is to notify you that a legal hold has been placed on documents and communications related to the following matter:</p>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Legal Hold Name:</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${legal_hold.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Description:</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${legal_hold.description}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Reason:</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${legal_hold.reason}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Type:</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${legal_hold.type}</td>
          </tr>
        </table>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">⚠️ Preservation Requirements</h3>
          <p style="margin-bottom: 0;">You are required to preserve all documents, electronic files, and communications related to this matter, including:</p>
          <ul style="margin: 10px 0;">
            <li>Emails, text messages, and instant messages</li>
            <li>Documents, spreadsheets, presentations</li>
            <li>Electronic files on computers, mobile devices, and cloud storage</li>
            <li>Voicemails and recorded conversations</li>
          </ul>
        </div>
        
        ${legal_hold.custodian_instructions ? `
          <div style="background: #e3f2fd; border: 1px solid #90caf9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #1565c0; margin-top: 0;">📋 Additional Instructions</h3>
            <p style="margin-bottom: 0;">${legal_hold.custodian_instructions}</p>
          </div>
        ` : ''}
        
        <div style="background: #e8f5e8; border: 1px solid #a5d6a7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Please acknowledge receipt</strong> of this notice by logging into the legal document management system or by replying to this email.</p>
        </div>
        
        <p>If you have any questions about this legal hold, please contact the legal team immediately.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; font-size: 14px; margin: 0;">Legal Department</p>
      </div>
    `;

    return { subject, text, html };
  }

  private generateLegalHoldReleaseTemplate(
    custodian: LegalHoldCustodian & { custodian: User; legal_hold: LegalHold },
  ): EmailTemplate {
    const { legal_hold, custodian: user } = custodian;
    
    const subject = `Legal Hold Released: ${legal_hold.name}`;
    
    const text = `
Dear ${user.display_name},

This is to notify you that the legal hold "${legal_hold.name}" has been released as of ${legal_hold.released_at?.toLocaleDateString()}.

You may now resume normal document retention policies for materials related to this matter.

${legal_hold.release_reason ? `Release Reason: ${legal_hold.release_reason}` : ''}

If you have any questions, please contact the legal team.

Thank you for your cooperation during this legal hold period.

Legal Department
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #155724; margin: 0;">✅ Legal Hold Released</h2>
        </div>
        
        <p>Dear <strong>${user.display_name}</strong>,</p>
        
        <p>This is to notify you that the legal hold "<strong>${legal_hold.name}</strong>" has been released as of <strong>${legal_hold.released_at?.toLocaleDateString()}</strong>.</p>
        
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">You may now resume normal document retention policies for materials related to this matter.</p>
        </div>
        
        ${legal_hold.release_reason ? `
          <p><strong>Release Reason:</strong> ${legal_hold.release_reason}</p>
        ` : ''}
        
        <p>If you have any questions, please contact the legal team.</p>
        
        <p>Thank you for your cooperation during this legal hold period.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; font-size: 14px; margin: 0;">Legal Department</p>
      </div>
    `;

    return { subject, text, html };
  }

  private generateComplianceReminderTemplate(
    custodian: LegalHoldCustodian & { custodian: User; legal_hold: LegalHold },
  ): EmailTemplate {
    const { legal_hold, custodian: user } = custodian;
    
    const subject = `Compliance Reminder: Legal Hold ${legal_hold.name}`;
    
    const text = `
Dear ${user.display_name},

This is a reminder regarding the active legal hold "${legal_hold.name}".

Please ensure you continue to preserve all documents and communications related to this matter. If you have not yet acknowledged this legal hold, please do so immediately.

Legal Hold Details:
- Name: ${legal_hold.name}
- Type: ${legal_hold.type}
- Created: ${legal_hold.created_at.toLocaleDateString()}

Please log into the legal document management system to review your compliance status.

If you have any questions or concerns, please contact the legal team immediately.

Legal Department
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #856404; margin: 0;">⏰ Compliance Reminder</h2>
        </div>
        
        <p>Dear <strong>${user.display_name}</strong>,</p>
        
        <p>This is a reminder regarding the active legal hold "<strong>${legal_hold.name}</strong>".</p>
        
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">Please ensure you continue to preserve all documents and communications related to this matter. If you have not yet acknowledged this legal hold, please do so immediately.</p>
        </div>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Legal Hold Name:</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${legal_hold.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Type:</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${legal_hold.type}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Created:</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${legal_hold.created_at.toLocaleDateString()}</td>
          </tr>
        </table>
        
        <p>Please log into the legal document management system to review your compliance status.</p>
        
        <p>If you have any questions or concerns, please contact the legal team immediately.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; font-size: 14px; margin: 0;">Legal Department</p>
      </div>
    `;

    return { subject, text, html };
  }

  private async simulateEmailSending(email: string, template: EmailTemplate): Promise<void> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, you would integrate with an email service here
    // For example:
    // await this.emailService.send({
    //   to: email,
    //   subject: template.subject,
    //   text: template.text,
    //   html: template.html,
    // });
    
    this.logger.debug(`Email sent to ${email}: ${template.subject}`);
  }
}