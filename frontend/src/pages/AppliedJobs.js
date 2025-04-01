// import React, { useEffect, useState, useContext } from "react";
// import { logincontext } from "../contexts/Logincontext";
// import axios from "axios";
// import "./Connections.css";

// const AppliedJobs = () => {
//   const [currentuser] = useContext(logincontext);
//   const [appliedJobs, setAppliedJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAppliedJobs = async () => {
//       try {
//         const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
//         const email = loggedInUser?.email;

//         if (!email) {
//           setError("User not logged in");
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get(`http://127.0.0.1:5000/appliedjobs/${email}`);
//         setAppliedJobs(response.data);
//       } catch (err) {
//         setError("Failed to fetch applied jobs");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAppliedJobs();
//   }, []); // ✅ No need to depend on currentuser.email

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Loading applied jobs...</p>
//       </div>
//     );
//   }

//   if (error) return <div>{error}</div>;

//   return (
//     <div className="connections-container">
//       <h1 className="connections-heading">Applied Jobs</h1>
//       <div className="profile-cards">
//         {appliedJobs.length > 0 ? (
//           appliedJobs.map((job, index) => (
//             <div key={index} className="profile-card">
//               <h2>{job.company}</h2>
//               <p><strong>Role:</strong> {job.role}</p>
//             </div>
//           ))
//         ) : (
//           <div>No jobs applied yet.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AppliedJobs;


// import React, { useEffect, useState, useContext } from "react";
// import { logincontext } from "../contexts/Logincontext";
// import axios from "axios";
// import "./Connections.css";

// const AppliedJobs = () => {
//   const [currentuser] = useContext(logincontext);
//   const [appliedJobs, setAppliedJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAppliedJobs = async () => {
//       try {
//         const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
//         const email = loggedInUser?.email;

//         if (!email) {
//           setError("User not logged in");
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get(`http://127.0.0.1:5000/appliedjobs/${email}`);
//         setAppliedJobs(response.data);
//       } catch (err) {
//         setError("Failed to fetch applied jobs");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAppliedJobs();
//   }, []);

//   const handleWithdraw = async (job) => {
//     try {
//       const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
//       const email = loggedInUser?.email;

//       const response = await axios.delete("http://127.0.0.1:5000/withdrawjob", {
//         data: { email: email, company: job.company, role: job.role }
//       });

//       if (response.status === 200) {
//         setAppliedJobs(appliedJobs.filter(j => j.company !== job.company || j.role !== job.role));
//       }
//     } catch (err) {
//       setError("Failed to withdraw job");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Loading applied jobs...</p>
//       </div>
//     );
//   }

//   if (error) return <div className="error-message">{error}</div>;

//   return (
//     <div className="connections-container">
//       <h1 className="connections-heading">Applied Jobs</h1>
//       <div className="profile-cards">
//         {appliedJobs.length > 0 ? (
//           appliedJobs.map((job, index) => (
//             <div key={index} className="profile-card">
//               <h2>{job.company}</h2>
//               <p><strong>Role:</strong> {job.role}</p>
//               <button className="withdraw-button" onClick={() => handleWithdraw(job)}>
//                 Withdraw
//               </button>
//             </div>
//           ))
//         ) : (
//           <div>No jobs applied yet.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AppliedJobs;

import React, { useEffect, useState, useContext } from "react";
import { logincontext } from "../contexts/Logincontext";
import axios from "axios";
import "./AppliedJobs.css";

const AppliedJobs = () => {
  const [currentuser] = useContext(logincontext);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeJob, setActiveJob] = useState(null); // Track clicked job

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
        const email = loggedInUser?.email;

        if (!email) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://127.0.0.1:5000/appliedjobs/${email}`);
        setAppliedJobs(response.data);
      } catch (err) {
        setError("Failed to fetch applied jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  const handleWithdraw = async (job) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("LoggedInUser"));
      const email = loggedInUser?.email;

      const response = await axios.delete("http://127.0.0.1:5000/withdrawjob", {
        data: { email: email, company: job.company, role: job.role }
      });

      if (response.status === 200) {
        setAppliedJobs(appliedJobs.filter(j => j.company !== job.company || j.role !== job.role));
        setActiveJob(null);
      }
    } catch (err) {
      setError("Failed to withdraw job");
    }
  };

  const toggleWithdraw = (index) => {
    setActiveJob(activeJob === index ? null : index);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applied jobs...</p>
      </div>
    );
  }

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="connections-container">
      <h1 className="connections-heading">Applied Jobs</h1>
      <div className="profile-cards">
        {appliedJobs.length > 0 ? (
          appliedJobs.map((job, index) => (
            <div
              key={index}
              className={`profile-card ${activeJob === index ? "active" : ""}`}
              onClick={() => toggleWithdraw(index)}
            >
              <h2>{job.company}</h2>
              <p><strong>Role:</strong> {job.role}</p>
              {activeJob === index && (
                <button className="withdraw-button" onClick={() => handleWithdraw(job)}>
                  Withdraw
                </button>
              )}
            </div>
          ))
        ) : (
          <div>No jobs applied yet.</div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;