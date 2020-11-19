const sgMail = require('@sendgrid/mail')
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
sgMail.setApiKey(SENDGRID_API_KEY)

const welcomeMail = (email,name)=>{

    const msg = {
        to: email, // Change to your recipient
        from: 'avijit.tict@gmail.com', // Change to your verified sender
        subject: 'Welcome to our App.',
        text: `Hi ${name} welcome to our app.`,
       
      }
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
          console.error(error)
        })

}

const goodbyeMail = (email,name)=>{

  const msg = {
      to: email, // Change to your recipient
      from: 'avijit.tict@gmail.com', // Change to your verified sender
      subject: 'Good bye from our App.',
      text: `Good bye ${name} .`,
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

}

module.exports = {
    welcomeMail,
    goodbyeMail
}
