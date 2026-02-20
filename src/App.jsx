import React, { useState, useEffect } from 'react';
import Builder from './Builder.jsx';

const Y = "#F0C419";
const BK = "#0C0C0C";

function Hero({ onStartBuilding }) {
  return (
    <div style={{minHeight:'100vh', background:BK, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .hero-start-btn {
          background: ${Y};
          color: ${BK};
          border: none;
          padding: 1.25rem 3.5rem;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 40px rgba(240,196,25,0.3), 0 0 0 1px rgba(240,196,25,0.1);
          transition: all 0.3s;
          margin-bottom: 3rem;
          letter-spacing: 0.02em;
        }
        @media (max-width: 640px) {
          .hero-logo { height: 56px !important; }
          .hero-header { padding: 1.25rem !important; }
          .hero-main { padding: 0 1rem !important; }
          .hero-start-btn { width: 100%; padding: 1.1rem 2rem; font-size: 1.05rem; }
          .hero-footer { padding: 1.25rem !important; font-size: 0.78rem !important; }
        }
      `}</style>

      {/* Gradient overlay */}
      <div style={{position:'absolute', inset:0, background:'radial-gradient(circle at 50% 20%, rgba(240,196,25,0.08) 0%, transparent 60%)', pointerEvents:'none'}}/>

      {/* Header */}
      <div className="hero-header" style={{padding:'2rem', display:'flex', justifyContent:'center', position:'relative', zIndex:10}}>
        <img className="hero-logo" src="/kc-logo.png" alt="King Contractor Agency" style={{height:'80px', width:'auto'}} />
      </div>

      {/* Main content */}
      <div className="hero-main" style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 2rem', position:'relative', zIndex:1}}>
        <div className="hero-content" style={{textAlign:'center', maxWidth:'800px', width:'100%'}}>
          <h1 style={{
            fontFamily:"'Inter', sans-serif",
            fontSize:'clamp(2.2rem, 7vw, 4.5rem)',
            fontWeight:'800',
            color:'#fff',
            lineHeight:1.1,
            marginBottom:'1.5rem',
            letterSpacing:'-0.02em'
          }}>
            AI Website Generator<br/>for Contractors
          </h1>

          <p style={{
            color:'rgba(255,255,255,0.7)',
            fontSize:'clamp(1rem, 2.5vw, 1.35rem)',
            maxWidth:'600px',
            margin:'0 auto 3rem',
            fontWeight:'400',
            lineHeight:1.6
          }}>
            Professional websites in 5 minutes. AI writes everything. Download HTML or get instant live URL. $97.
          </p>

          <button
            className="hero-start-btn"
            onClick={onStartBuilding}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 50px rgba(240,196,25,0.4), 0 0 0 1px rgba(240,196,25,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 40px rgba(240,196,25,0.3), 0 0 0 1px rgba(240,196,25,0.1)';
            }}
          >
            START BUILDING
          </button>

          <div style={{
            display:'flex',
            gap:'2rem',
            justifyContent:'center',
            flexWrap:'wrap',
            opacity:0.6
          }}>
            {['AI-Powered', 'No Coding', 'Instant Deploy'].map((item,i)=>(
              <div key={i} style={{
                color:'#888',
                fontSize:'0.9rem',
                fontWeight:'500',
                letterSpacing:'0.5px',
                textTransform:'uppercase'
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="hero-footer" style={{padding:'2rem', textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', position:'relative', zIndex:10}}>
        Professional, SEO-optimized websites for home service contractors — powered by AI
      </div>
    </div>
  );
}

function Generating({ businessName }) {
  return (
    <div style={{minHeight:'100vh', background:BK, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'4rem', marginBottom:'2rem', animation:'pulse 2s infinite'}}>⚡</div>
        <h2 style={{fontFamily:"'Inter', sans-serif", fontSize:'2.5rem', fontWeight:'700', color:'#fff', marginBottom:'1rem', letterSpacing:'-0.01em'}}>
          Generating Your Website
        </h2>
        <p style={{color:'#888', fontSize:'1.1rem', marginBottom:'2rem'}}>
          AI is writing your content... This takes 10-15 seconds.
        </p>
        <div style={{color:'#666', fontSize:'0.9rem'}}>
          Do not refresh or close this page
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function Results({ html, businessName, netlifyUrl, onBuildAnother }) {
  const [tab, setTab] = useState('preview');

  const downloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-website.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{minHeight:'100vh', background:BK}}>
      <style>{`
        * { box-sizing: border-box; }
        .results-wrap { padding: 2rem; }
        .results-tab-btn { background: none; border: none; color: #888; padding: 1rem 2rem; font-family: 'Inter', sans-serif; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .results-card { padding: 3rem; }
        .results-dl-btn { background: ${Y}; color: ${BK}; border: none; padding: 1.25rem 3rem; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 1.15rem; font-weight: 700; cursor: pointer; }
        .results-another-btn { background: transparent; color: #fff; border: 1px solid #333; padding: 1rem 2rem; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 1.05rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        @media (max-width: 640px) {
          .results-wrap { padding: 1rem; }
          .results-h1 { font-size: clamp(1.75rem, 7vw, 3rem) !important; }
          .results-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .results-tab-btn { padding: 0.75rem 1rem; font-size: 0.95rem; }
          .results-card { padding: 1.5rem !important; }
          .results-dl-btn { width: 100%; }
          .results-another-btn { width: 100%; }
        }
      `}</style>
      <div className="results-wrap" style={{maxWidth:'1400px', margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:'3rem'}}>
          <div style={{fontSize:'4rem', marginBottom:'1rem'}}>✓</div>
          <h1 className="results-h1" style={{fontFamily:"'Inter', sans-serif", fontSize:'3rem', fontWeight:'800', color:'#fff', marginBottom:'1rem', letterSpacing:'-0.01em'}}>
            Your Website is Ready!
          </h1>
          <p style={{color:'#aaa', fontSize:'1.1rem'}}>Preview, download, or deploy below</p>
        </div>

        {netlifyUrl && (
          <div style={{background:'rgba(76, 175, 80, 0.1)', border:'2px solid #4CAF50', borderRadius:'12px', padding:'2rem', maxWidth:'700px', margin:'0 auto 2rem', textAlign:'center'}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🌐</div>
            <h3 style={{fontFamily:"'Inter', sans-serif", fontSize:'1.5rem', color:'#4CAF50', marginBottom:'1rem', fontWeight:'700'}}>LIVE ON THE WEB</h3>
            <a href={netlifyUrl} target="_blank" rel="noopener" style={{color:'#4CAF50', fontSize:'1.05rem', wordBreak:'break-all', textDecoration:'none', fontWeight:'600', display:'block', marginBottom:'1.5rem'}}>{netlifyUrl}</a>
            <a href={netlifyUrl} target="_blank" rel="noopener" style={{display:'inline-block', background:'#4CAF50', color:'#fff', padding:'1rem 2.5rem', borderRadius:'8px', textDecoration:'none', fontFamily:"'Inter', sans-serif", fontSize:'1.1rem', fontWeight:'700'}}>
              VIEW LIVE SITE
            </a>
          </div>
        )}

        <div className="results-tabs" style={{display:'flex', gap:'0', marginBottom:'2rem', borderBottom:'1px solid #222'}}>
          {[
            {id:'preview', label:'Preview'},
            {id:'download', label:'Download'},
            {id:'deploy', label:'Deploy Guide'}
          ].map(t=>(
            <button key={t.id} className="results-tab-btn" onClick={()=>setTab(t.id)}
              style={{borderBottom: tab===t.id ? `3px solid ${Y}` : 'none', color: tab===t.id ? Y : '#888'}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'preview' && (
          <iframe srcDoc={html} style={{width:'100%', height:'80vh', border:'1px solid #222', borderRadius:'8px', background:'#fff'}} />
        )}

        {tab === 'download' && (
          <div className="results-card" style={{background:'#111', border:'1px solid #222', borderRadius:'8px', padding:'3rem', maxWidth:'700px', margin:'0 auto', textAlign:'center'}}>
            <div style={{fontSize:'4rem', marginBottom:'1rem'}}>📥</div>
            <h2 style={{fontFamily:"'Inter', sans-serif", fontSize:'2rem', color:'#fff', marginBottom:'1rem', fontWeight:'700'}}>Download HTML</h2>
            <p style={{color:'#aaa', fontSize:'1rem', marginBottom:'2rem'}}>Get the complete HTML file. Host anywhere.</p>
            <button className="results-dl-btn" onClick={downloadHTML}>
              DOWNLOAD HTML
            </button>
          </div>
        )}

        {tab === 'deploy' && (
          <div className="results-card" style={{background:'#111', border:'1px solid #222', borderRadius:'8px', padding:'3rem', maxWidth:'800px', margin:'0 auto'}}>
            <h2 style={{fontFamily:"'Inter', sans-serif", fontSize:'2rem', color:'#fff', marginBottom:'2rem', fontWeight:'700'}}>Deployment Options</h2>
            {[
              {title: 'Option 1: Netlify (Free)', steps: ['Go to app.netlify.com/drop', 'Drag your HTML file', 'Get instant live URL']},
              {title: 'Option 2: Your Hosting', steps: ['Download HTML above', 'Upload via FTP/cPanel', 'Rename to index.html']},
              {title: 'Option 3: Full Service', steps: ['We handle everything', 'Email: support@kingcontractor.com']}
            ].map((opt,i)=>(
              <div key={i} style={{marginBottom:'2.5rem'}}>
                <h3 style={{fontFamily:"'Inter', sans-serif", fontSize:'1.4rem', color:Y, marginBottom:'1rem', fontWeight:'600'}}>{opt.title}</h3>
                <ol style={{color:'#aaa', lineHeight:1.8, paddingLeft:'1.5rem'}}>
                  {opt.steps.map((s,j)=><li key={j}>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
        )}

        <div style={{textAlign:'center', marginTop:'3rem', paddingTop:'3rem', borderTop:'1px solid #222'}}>
          <button className="results-another-btn" onClick={onBuildAnother}>
            BUILD ANOTHER ($97)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState('hero');
  const [html, setHtml] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [netlifyUrl, setNetlifyUrl] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const canceled = params.get('canceled');

    if (canceled) {
      alert('Payment canceled. Your form data was saved.');
      window.history.replaceState({}, '', '/');
      setStage('hero');
      return;
    }

    if (sessionId) {
      setStage('generating');
      
      // Timeout fallback - if nothing happens in 30 seconds, show error
      const timeout = setTimeout(() => {
        console.error('Payment verification timeout');
        alert('Payment verification took too long. Please contact support.');
        setStage('hero');
      }, 30000);
      
      fetch(`/api/verify-payment/${sessionId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          clearTimeout(timeout);
          console.log('Payment verification response:', data);
          console.log('Setting submissionId to:', data.submissionId);
          console.log('Setting businessName to:', data.businessName);
          console.log('Setting submissionData to:', data.data);
          
          if (data.paid === true) {
            setSubmissionId(data.submissionId);
            setBusinessName(data.businessName);
            setSubmissionData(data.data);
            window.history.replaceState({}, '', '/');
          } else {
            console.error('Payment verification failed:', data);
            alert('Payment not completed: ' + (data.error || 'Unknown error'));
            setStage('hero');
          }
        })
        .catch(err => {
          clearTimeout(timeout);
          console.error('Payment verification error:', err);
          alert('Could not verify payment: ' + err.message);
          setStage('hero');
        });
    }
  }, []);

  const handleFormComplete = async (formData) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      const data = await res.json();
      const checkoutRes = await fetch(`/api/create-checkout/${data.submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const checkoutData = await checkoutRes.json();
      window.location.href = checkoutData.url;
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleGenerated = async (generatedHtml) => {
    console.log('Website generated! HTML length:', generatedHtml.length);
    
    // Try to deploy, but don't block if it fails
    try {
      console.log('Attempting deployment to Netlify...');
      const deployRes = await fetch(`/api/deploy/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          html: generatedHtml,
          siteName: businessName 
        }),
      });
      
      if (deployRes.ok) {
        const deployData = await deployRes.json();
        if (deployData.url) {
          console.log('Deployment succeeded:', deployData.url);
          setNetlifyUrl(deployData.url);
        }
      } else {
        console.warn('Deployment failed, but continuing anyway');
      }
    } catch (err) {
      console.warn('Deployment error (non-fatal):', err);
    }
    
    // Save HTML regardless of deployment status
    setHtml(generatedHtml);
    setStage('results');
  };

  const resetApp = () => {
    setStage('hero');
    setHtml(null);
    setBusinessName('');
    setSubmissionId(null);
    setSubmissionData(null);
    setNetlifyUrl(null);
  };

  if (stage === 'results') {
    return <Results html={html} businessName={businessName} netlifyUrl={netlifyUrl} onBuildAnother={resetApp} />;
  }

  if (stage === 'generating') {
    return (
      <>
        <Generating businessName={businessName} />
        {submissionData ? (
          <div style={{display:'none'}}>
            <Builder autoGenerate={true} prefilledData={submissionData} onGenerated={handleGenerated} submissionId={submissionId} />
          </div>
        ) : (
          <div style={{position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)', background:'#ff6b6b', color:'white', padding:'1rem 2rem', borderRadius:'8px', fontSize:'0.9rem', zIndex:1000}}>
            Error: No submission data. Check console (F12)
          </div>
        )}
      </>
    );
  }

  if (stage === 'builder') {
    return <Builder onFormComplete={handleFormComplete} submissionId={submissionId} />;
  }

  return <Hero onStartBuilding={() => setStage('builder')} />;
}
