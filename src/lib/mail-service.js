import nodemailer from 'nodemailer'
import postmarkTransport from 'nodemailer-postmark-transport'
import { getEnvironment } from '@dtails/toolbox-backend'

export async function sendSupportErrorMail(errorMessage) {
  const toEmail = getEnvironment('SUPPORT_MAIL')
  const textBody = 'An unexpected error occurred: ' + errorMessage
  await sendMail(toEmail, 'An unexpected error occurred - action required', textBody, [])
}

export async function sendCustomerDataMail(contactMail) {
  await sendMail(contactMail, 'TODO', 'TODO', null)
}

async function sendMail(toEmail, subject, textBody, attachments) {
  const transport = nodemailer.createTransport(postmarkTransport({
    auth: {
      apiKey: getEnvironment('POSTMARK_API_KEY')
    }
  }))

  let mailSettings = {
    from: getEnvironment('POSTMARK_FROM_EMAIL'),
    to: toEmail,
    subject: 'App template app: ' + subject,
    text: textBody + '\r\n\r\nKind regards from the App Template app team',
    html: null,
    attachments: attachments
  }

  const result = await transport.sendMail(mailSettings)
  if (result.messageId && result.rejected.length == 0) {
    return true
  } else {
    return false
  }
}