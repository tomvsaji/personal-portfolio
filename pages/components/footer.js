import React from 'react'

const Footer = () => {
  return (
    <div className="footer-container">
        <div className="footer-links">
          <a href="#about">ABOUT</a>
          <span> | </span>
          <a href="#works">WORKS</a>
          <span> | </span>
          <a href="#contact">CONTACT</a>
        </div>
        <div className="footer-copyrights">
          <p>Handcrafted by me &#169; 2023</p>
        </div>
      <style jsx>{`
      .footer-container {
        background: #000000;
        color: white;
        border-top: 1px solid #38E9BF;
        padding: 20px 50px 30px 50px;
        display: flex;
        justify-content: space-between;
      }

      .footer-links {
        font-family: 'Fira Sans';
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 24px;
        letter-spacing: 0.01em;
      }

      .footer-links a {
        text-decoration: none;
        color: #ffffff;
      }

      .footer-links > a:hover {
        color: #38E9BF;
        text-decoration-line: underline;
        cursor: pointer;
      }

      .footer-copyrights {
        font-family: 'EB Garamond';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 21px;
        letter-spacing: 0.01em;
        color: #FFFFFF;
      }

      @media only screen and (max-width: 600px) {
        .footer-container {
          flex-direction: column;
          text-align: center;
        }

        .footer-links {
          margin-bottom: 15px;
        }

        .footer-links a {
          font-size: 16px;
        }

        .footer-copyrights {
          font-size: 14px;
        }
      }
      `}</style>
    </div>
  )
}

export default Footer