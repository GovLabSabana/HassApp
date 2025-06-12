import React from 'react';
import { Sidebar } from '../components/Sidebar';
import '../componentsStyles/Developers.css';

interface Creator {
  id: number;
  name: string;
  role: string;
  github?: string;
  linkedin?: string;
  email?: string;
  image: string;
}

const creatorsData: Creator[] = [
  {
    id: 1,
    name: "Oscar Vergara",
    role: "Full-stack Developer",
    github: "https://github.com/Oscarvm117",
    linkedin: "https://www.linkedin.com/in/oscar-david-vergara-moreno-b0018b146?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    email: "oscarvemo@unisabana.edu.co",
    image: "/Oscar.jpg"
  },
  {
    id: 2,
    name: "Juan Rodríguez",
    role: "Full-stack Developer",
    github: "https://github.com/JuanJoseRodriguezF",
    linkedin: "https://www.linkedin.com/in/juan-jos%C3%A9-rodr%C3%ADguez-68a595255?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",    
    email: "juanrodfa@unisabana.edu.co",
    image: "/JuanJoseRodriguez.jpg"
  },
  {
    id: 3,
    name: "Juan Sotelo",
    role: "Product Manager",
    github: "https://github.com/juansotag",
    linkedin: "https://www.linkedin.com/in/juan-diego-sotelo-aguilar-b421741a3?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    email: "juansotag@unisabana.edu.co",
    image: "/JuanSotelo.jpg"
  },
  {
    id: 4,
    name: "Johan Jiménez",
    role: "Full-stack Developer",
    github: "https://github.com/Jhojan-Jimenez",
    linkedin: "",
    email: "jhojanjiam@unisabana.edu.co",
    image: ""
  },
  {
    id: 5,
    name: "Daniel Santiago Ramirez",
    role: "Full-stack Developer",
    github: "https://github.com/Santii08",
    linkedin: "https://www.linkedin.com/in/daniel-santiago-ramirez-chinchilla-a235aa25a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    email: "danielrach@unisabana.edu.co",
    image: ""
  }
];

export default function Creators() {
  return (
    <div className="creators-container">
      <div className="creators-sidebar">
        <Sidebar />
      </div>

      <main className="creators-main">
        <div className="creators-header">
          <h1 className="creators-title">Nuestro Equipo de Desarrollo</h1>
        </div>

        <div className="creators-grid">
          {creatorsData.map((creator) => (
            <div key={creator.id} className="creator-card">
              <div className="creator-image-container">
                <img 
                  src={creator.image} 
                  alt={creator.name}
                  className={`creator-image${creator.name === 'Oscar Vergara' ? ' oscar-image' : ''}`}
                />
                <div className="creator-overlay">
                  <div className="creator-social">
                    {creator.github && (
                      <a href={creator.github} target="_blank" rel="noopener noreferrer" className="social-link">
                        <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                    {creator.linkedin && (
                      <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {creator.email && (
                      <a href={`mailto:${creator.email}`} className="social-link">
                        <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-1.37.603-2.845.997-4.376 1.195 1.576-.932 2.788-2.416 3.358-4.177-1.478.869-3.114 1.496-4.857 1.837-1.396-1.472-3.386-2.391-5.588-2.391-4.226 0-7.647 3.394-7.647 7.576 0 .596.067 1.176.196 1.735-6.355-.317-11.993-3.334-15.764-7.928-.659 1.118-1.037 2.416-1.037 3.805 0 2.627 1.351 4.943 3.403 6.299-1.254-.04-2.433-.38-3.466-.944v.096c0 3.673 2.636 6.733 6.132 7.429-.641.173-1.315.267-2.011.267-.492 0-.971-.048-1.438-.138.971 3.006 3.783 5.195 7.118 5.255-2.616 2.027-5.914 3.236-9.492 3.236-.617 0-1.227-.036-1.826-.106 3.384 2.145 7.408 3.398 11.722 3.398 14.063 0 21.746-11.525 21.746-21.52 0-.328-.008-.655-.022-.979 1.495-1.067 2.795-2.401 3.822-3.921z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="creator-content">
                <h3 className="creator-name">{creator.name}</h3>
                <p className="creator-role">{creator.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="creators-footer">
          <div className="team-stats">
            <div className="stat-item">
              <h4>5</h4>
              <p>Desarrolladores</p>
            </div>
            <div className="stat-item">
              <h4>200+</h4>
              <p>Horas de Código</p>
            </div>
            <div className="stat-item">
              <h4>1</h4>
              <p>Proyecto Exitoso</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}