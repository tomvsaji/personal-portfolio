import React from 'react'

const Projects = () => {
  return (
    <div id="works" className="projects-done">
      <h2>Projects Done</h2>
      <p>Once in a while I enjoy doing hobby/side projects. Here are a few that I like to show off</p>
      <div className="projects-list-container">
        <a href="https://vstylegarments.com" target="_blank" style={{textDecoration: 'none', color: 'black', maxWidth: '330px', width: '100%'}}>
          <div className="project-list-item">
            <img style={{maxWidth: '330px', width: '100%'}} src='/client-project1.png' alt='client-project1' />
            <h3>V Style Garments</h3>
            <p>V Style Garments is a clothing retial and customizing store for women in Kerala</p>
          </div>
        </a>
        <a href="https://amk.qa" target="_blank" style={{textDecoration: 'none', color: 'black', maxWidth: '330px', width: '100%'}}>
          <div className="project-list-item">
            <img style={{maxWidth: '330px', width: '100%'}} src='/client-project2.png' alt='client-project2' />
            <h3>AMK Safety and Security</h3>
            <p>AMK Safety and Security is a fire safety and security company based out of Qatar. The requirements for them were to create a landing page with contact options end to end and a brochure for the organization</p>
          </div>
        </a>
      </div>
      <style jsx>{`
      .projects-done {
        background: #FFF0E5;
        padding-bottom: 10px;
        padding: 20px;
      }

      .projects-done h2 {
        font-family: 'Fira Sans Condensed';
        font-weight: 600;
        font-size: 48px;
        margin-left: 80px;
        padding-top: 20px;
      }

      .projects-done > p {
        font-family: 'EB Garamond';
        font-weight: 400;
        font-size: 20px;
        margin: 0 80px;
      }

      .projects-list-container {
        border: 1px solid #000000;
        margin: 25px auto;
        max-width: 1072px;
        box-shadow: 5px 5px 0px black;
        padding: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }

      .project-list-item {
        max-width: 330px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .project-list-item > h3 {
        font-family: 'open sans';
        font-weight: 700;
        font-size: 20px;
      }

      .project-list-item > p {
        font-family: 'EB Garamond';
        font-weight: 400;
        font-size: 14px;
        text-align: left;
        line-height: 18.27px;
        max-width: 210px;
      }

      @media only screen and (max-width: 600px) {
        .projects-done > p {
          margin: 0px;
        }

        .projects-done h2 {
          margin: 0;
        }

        .projects-list-container {
          padding: 10px;
        }

        .project-list-item > p {

        }
      }
      `}</style>
    </div>
  )
}

export default Projects