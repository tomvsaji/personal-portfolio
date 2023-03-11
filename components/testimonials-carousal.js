import React from 'react'

const TestimonialsCarousal = () => {
  return (
    <div className='testimonial-box'>
      <p className="testimonial-review">“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad”</p>
      <p className="testimonial-name">Tom V Saji</p>
      <p className="testimonial-desc">Creative Lead, Good Kind</p>
      <style jsx>{`
      .testimonial-box {
        background: #EAFDC6;
        border-radius: 20px;
        max-width: 430px;
        margin: 0 auto;
        padding: 20px 35px;
      }

      .testimonial-review {  
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
        letter-spacing: 0.01em;
        color: #000000;
        margin-bottom: 20px;
      }

      .testimonial-name {
        font-family: 'Fira Sans Condensed';
        font-style: normal;
        font-weight: 700;
        font-size: 22px;
        line-height: 26px;
        text-align: center;
        letter-spacing: 0.01em;
        color: #000000;
      }

      .testimonial-desc {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
        letter-spacing: 0.01em;
        color: #000000;
      }
      `}</style>   
    </div>
  )
}

export default TestimonialsCarousal