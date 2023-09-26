import React from 'react'

const Header = () => {
  return (
    <div className="header">
      <div id='about' className="about-container">
        <div className="about-text">
          <h1>
            Web Developer, Designer and Content Creator
          </h1>
          <p>
            Hey, I am Tom. Currently working as a Software Engineer at Applab Qatar. I work on Azure environments. Creating custom solutions for Azure Resources such as Cogntive Search, Azure Front Door and CDN, Azure Devops using Azure Functions, Azure App Service.
          </p>
        </div>
        <div className="about-image">
          <img style={{width: '180px', height: '250px', objectFit: 'cover', borderRadius: '20px', border: '1px solid #000000', boxShadow: '5px 5px #FFF0E5'}} src="/tom-image.jpg" alt="profile picture" />
        </div>
      </div>
      <div className="skills-container">
        <h2>Areas of Expertise</h2>
        <div className="skills-list">
          <div className="skills-list-items" style={{borderRight: '2px solid #38E9BF', paddingRight: '50px'}}>
            <ul>
              <li>Next Js</li>
              <li>React.js</li>
              <li>Node.js</li>
              <li>CSS</li>
              <li>HTML</li>
              <li>JavaScript</li>
              <li>SQL</li>
            </ul>
          </div>
          <div className="skills-list-items">
            <ul>
              <li>GitHub</li>
              <li>Various AWS Services</li>
              <li>Figma</li>
              <li>Adobe Photoshop</li>
              <li>Premiere Pro</li>
              <li>Lightroom</li>
              <li>Managing social media</li>
            </ul>
          </div>
        </div>
      </div>
    <style jsx>{`
    .header {
      background: #000000;
      min-height: calc(100vh - 80px);
      padding-bottom: 5px;
    }

    .about-container {
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-top: 30px;
      max-width: 1000px;
    }

    .about-text {
      max-width: 473px;
    }

    .about-text h1 {
      font-family: 'Fira Sans Condensed';
      font-style: normal;
      font-weight: 600;
      font-size: 45px;
      line-height: 54px;
      letter-spacing: 0.01em;
      color: #FFFFFF;
      margin-bottom: 20px;
    }

    .about-text p {
      font-family: 'EB Garamond';
      font-style: normal;
      font-weight: 400;
      font-size: 20px;
      line-height: 26px;
      letter-spacing: 0.01em;
      color: #38E9BF;
      max-width: 360px;
    }

    .about-image {
      border-radius: 20px;
    }

    .skills-container {
      background: #4B02E8;
      color: white;
      max-width: 400px;
      margin: 50px auto;
      border-radius: 20px;
    }

    .skills-container > h2 {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 700;
      font-size: 32px;
      line-height: 44px;
      letter-spacing: 0.01em;
      border-bottom: 1px solid #38E9BF;
      padding-top: 8px;
      padding-left: 8px;
    }

    .skills-list {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      margin-top: 20px;
    }

    .skills-list-items {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 19px;
      letter-spacing: 0.01em; 
      padding-bottom: 10px; 
    }

    @media only screen and (max-width: 600px) {
      .header {
        padding: 20px;
        text-align: center;
      }

      .about-container {
        flex-direction: column;
      }

      .about-text {
        margin-bottom: 30px;
      }

      .about-text h1 {
        font-size: 40px;
        line-height: 48px;
      }

      .skills-list {
        text-align: left;
      }

      .skills-container h2 {
        font-size: 28px;
      }
    }
    `}</style>
    </div>
  )
}

export default Header
