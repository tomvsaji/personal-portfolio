import React from 'react'
import TestimonialsCarousal from './testimonials-carousal'
import { EmailNegative, InstagramNegative, LinkedInNegative, TwitterNegative, FacebookNegative } from './icons'

const Contact = () => {
  return (
    <div id="contact" className='contact-container'>
      <div className='contact-header'>
        <h2>Want to get in touch?</h2>
        <p>If you need help with creating something magical you can contact me through one of  these methods. Who knows ,maybe you would like to see some of the cool photos I post on Instagram</p>
      </div>
      <div className='testimonials-container'>
        <div className='testimonials'>
          <h3>TESTIMONIALS</h3>
          <p style={{marginBottom: '28px'}}>Oh wait, some of the awesome people I had worked with has some nice things to say about me</p>
          <TestimonialsCarousal />
        </div>
        <div className="socialmedia">
          <p>Social Links to Contact me</p>
          <div className="social-icons-container">
            <a href="https://www.instagram.com/tom_v_saji/" target='_blank'><InstagramNegative /></a>
            <a href="https://www.facebook.com/Tom.V.Saji" target='_blank'><FacebookNegative /></a>
            <a href="https://www.linkedin.com/in/tom-v-saji-455503202/" target='_blank'><LinkedInNegative /></a>
            <a href="https://twitter.com/tomvsaji2" target='_blank'><TwitterNegative /></a>
            <a href="mailto:tomvellavoor@gmail.com" target='_blank'><EmailNegative /></a>
          </div>
        </div>
      </div>
    <style jsx>{`
    .contact-header {
      background: #4B02E8;
      color: white;
      padding: 20px 188px
      // padding: 20px;
    }

    .contact-header > h2 {
      font-size: 64px;
      font-weight: 600;
      line-height: 76.8px;
      font-family: 'Fira Sans Condensed';
      max-width: 400px;
    }

    .contact-header > p {
      font-family: 'EB Garamond';
      font-weight: 400;
      font-size: 20px;
      line-height: 26px;
      padding-bottom: 10px;
    }

    .testimonials-container {
      background: #000000;
      color: white;
    }

    .testimonials {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      max-width: 540px;
      margin: 0 auto;
    }

    .testimonials > h3 {
      font-family: 'Fira Sans Condensed';
      font-style: normal;
      font-weight: 600;
      font-size: 24px;
      line-he ight: 29px;
      letter-spacing: 0.01em;
      margin-top: 20px;
    }

    .testimonials > p {
      font-family: 'EB Garamond';
      font-style: normal;
      font-weight: 400;
      font-size: 20px;
      line-height: 26px;
      letter-spacing: 0.01em;
      margin-top: 18px;
    }

    .testimonials-box {
      background: #EAFDC6;
      border-radius: 20px;
      max-width: 430px;
    }

    .socialmedia {
      font-family: 'EB Garamond';
      font-style: normal;
      font-weight: 400;
      font-size: 20px;
      line-height: 26px;
      letter-spacing: 0.01em;
      text-align: center;
      color: #FFFFFF;
      margin: 0 auto;
      padding-bottom: 30px;
    }

    .socialmedia > p {
      margin: 35px auto;
    }

    .social-icons-container {
      display: flex;
      justify-content: space-around;
      max-width: 320px;
      margin: 0 auto;
    }

    @media only screen and (max-width: 600px) {
      .contact-header {
        padding: 20px;
      }

      .contact-header h2 {
        font-size: 45px;
        line-height: 54px;
        max-width: 300px;
      }

      .testimonials-container {
        padding: 20px;
      }
    }
    `}</style>
    </div>
  )
}

export default Contact