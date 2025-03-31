import React, { useEffect, useState, useContext } from 'react';
import { logincontext } from "../contexts/Logincontext";
import axios from 'axios';
import "./Connections.css";

const Jobs = () => {
  const [currentuser] = useContext(logincontext);
  const [profiles, setProfiles] = useState([]);
  const [onlineJobs, setOnlineJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(null);

  const companies = ["microsoft", "oracle"];

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:5000/jobrec', {
          params: { email: currentuser.email }
        });
        const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
        const formattedData = data.map(profile => ({
          companyName: profile.company_name,
          role: profile.role,
          jobDescription: profile.job_description,
          experienceRequired: profile.experience_required,
          jobPostingDate: profile.job_posting_date,
          applicationDeadline: profile.application_deadline,
          location: profile.location,
        }));
        setProfiles(formattedData);
      } catch (err) {
        setError('Failed to fetch recommended jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentuser.email]);

  const toggleDetails = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const applyForJob = async (job) => {
    const email = currentuser?.email;
    if (!email) {
      alert("User is not logged in.");
      return;
    }

    try {
      const response = await axios.post(`http://127.0.0.1:5000/applyjob`, {
        email,
        company: job.companyName,
        role: job.role
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Error applying for job:", error.response?.data || error.message);
      alert("Failed to apply for job");
    }
  };

  const fetchOnlineJobs = async (company) => {
    const email = currentuser?.email;
    if (!email) {
      alert("User is not logged in.");
      return;
    }

    setLoadingCompany(company);
    try {
      const response = await axios.post("http://127.0.0.1:5000/get-jobs", {
        company,
        email
      });
      setOnlineJobs(prev => ({ ...prev, [company]: response.data.jobs }));
    } catch (error) {
      console.error(`Error fetching ${company} jobs:`, error);
      alert(`Failed to retrieve ${company} jobs`);
    } finally {
      setLoadingCompany(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div className="jobs-container">
      <div className="jobs-section">
        <h1 className="section-heading">Recommended Jobs</h1>
        <div className="profile-cards">
          {profiles.length > 0 ? profiles.map((profile, index) => (
            <div key={index} className="profile-card" onClick={() => toggleDetails(index)}>
              <h2>{profile.companyName}</h2>
              <p><strong>Role:</strong> {profile.role}</p>
              <p><strong>Location:</strong> {profile.location}</p>
              <p><strong>Experience Required:</strong> {profile.experienceRequired}</p>
              {expandedIndex === index && (
                <>
                  <div>
                    <h3>Job Description:</h3>
                    <p>{profile.jobDescription}</p>
                  </div>
                  <div>
                    <p><strong>Job Posting Date:</strong> {profile.jobPostingDate}</p>
                    <p><strong>Application Deadline:</strong> {profile.applicationDeadline}</p>
                  </div>
                  <button onClick={() => applyForJob(profile)} className="apply-button"> Apply </button>
                </>
              )}
            </div>
          )) : <p>No jobs available</p>}
        </div>
      </div>

      <div className="jobs-section">
        <h1 className="section-heading">Jobs Online</h1>
        <div className="job-buttons">
          {companies.map((company) => (
            <button key={company} onClick={() => fetchOnlineJobs(company)}>
              {company.charAt(0).toUpperCase() + company.slice(1)} Jobs
            </button>
          ))}
        </div>

        {loadingCompany && (
          <div className="loading-spinner">Fetching {loadingCompany} jobs...</div>
        )}
        {companies.map((company) => (
          onlineJobs[company]?.length > 0 && (
            <div key={company} className="job-list">
              <h2>{company.charAt(0).toUpperCase() + company.slice(1)} Jobs</h2>
              <ul>
                {onlineJobs[company].map((job, index) => (
                  <li key={index}>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      {job.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Jobs;

// import React, { useEffect, useState, useContext } from 'react';
// import { logincontext } from "../contexts/Logincontext";
// import axios from 'axios';
// import "./Connections.css";

// const Jobs = () => {
//   const [currentuser] = useContext(logincontext);
//   const [profiles, setProfiles] = useState([]);
//   const [onlineJobs, setOnlineJobs] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [expandedIndex, setExpandedIndex] = useState(null);
//   const [loadingCompany, setLoadingCompany] = useState(null);
//   const [expandedCompany, setExpandedCompany] = useState(null);

//   const companies_computer_science = ["microsoft", "oracle"];
//   const companies_mechanical_engineer = ["Hyundai", "Hitachi"];
//   const companies_electrical_engineer = ["Siemens", "ABB"];

//   console.log("Current user:");
//   console.log(currentuser);

//   const stream_user = async () => {
//     try {
//       const response = await axios.post('http://127.0.0.1:5000/get_degree', {
//         email: currentuser.email  // Remove `params` wrapper
//       });
  
//       const stream = response.data.degree;  // Assign returned degree to stream
//       return stream;  // Return the stream value if needed
  
//     } catch (error) {
//       console.error("Error fetching degree:", error);
//       return null; // Return null in case of an error
//     }
//   };
  

//   // const stream = currentuser.education[0]?.degree || "";
//   const stream = currentuser.education?.length > 0 ? currentuser.education[0].degree : "";

//   // Determine which companies to show based on the stream
//   let companies = [];
//   if (stream.includes("Computer Science")) {
//     companies = companies_computer_science;
//   } else if (stream.includes("Mechanical")) {
//     companies = companies_mechanical_engineer;
//   } else if (stream.includes("Electrical")) {
//     companies = companies_electrical_engineer;
//   }

//   useEffect(() => {
//     const fetchProfiles = async () => {
//       try {
//         const response = await axios.post('http://127.0.0.1:5000/jobrec', {
//           params: { email: currentuser.email }
//         });
//         const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
//         const formattedData = data.map(profile => ({
//           companyName: profile.company_name,
//           role: profile.role,
//           jobDescription: profile.job_description,
//           experienceRequired: profile.experience_required,
//           jobPostingDate: profile.job_posting_date,
//           applicationDeadline: profile.application_deadline,
//           location: profile.location,
//         }));
//         setProfiles(formattedData);
//       } catch (err) {
//         setError('Failed to fetch recommended jobs');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfiles();
//   }, [currentuser.email]);

//   const toggleDetails = (index) => {
//     setExpandedIndex(expandedIndex === index ? null : index);
//   };

//   const applyForJob = async (job) => {
//     const email = currentuser?.email;
//     if (!email) {
//       alert("User is not logged in.");
//       return;
//     }

//     try {
//       const response = await axios.post(`http://127.0.0.1:5000/applyjob`, {
//         email,
//         company: job.companyName,
//         role: job.role
//       });
//       alert(response.data.message);
//     } catch (error) {
//       console.error("Error applying for job:", error.response?.data || error.message);
//       alert("Failed to apply for job");
//     }
//   };

//   const fetchOnlineJobs = async (company) => {
//     if (expandedCompany === company) {
//       setExpandedCompany(null);
//       return;
//     }
    
//     setLoadingCompany(company);
//     try {
//       const response = await axios.post("http://127.0.0.1:5000/get-jobs", {
//         company,
//         email: currentuser?.email
//       });
//       setOnlineJobs(prev => ({ ...prev, [company]: response.data.jobs }));
//       setExpandedCompany(company);
//     } catch (error) {
//       console.error(`Error fetching ${company} jobs:`, error);
//       alert(`Failed to retrieve ${company} jobs`);
//     } finally {
//       setLoadingCompany(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Loading jobs...</p>
//       </div>
//     );
//   }

//   if (error) return <div>{error}</div>;

//   return (
//     <div className="jobs-container">
//       <div className="jobs-section">
//         <h1 className="section-heading">Recommended Jobs</h1>
//         <div className="profile-cards">
//           {profiles.length > 0 ? profiles.map((profile, index) => (
//             <div key={index} className="profile-card" onClick={() => toggleDetails(index)}>
//               <h2>{profile.companyName}</h2>
//               <p><strong>Role:</strong> {profile.role}</p>
//               <p><strong>Location:</strong> {profile.location}</p>
//               <p><strong>Experience Required:</strong> {profile.experienceRequired}</p>
//               {expandedIndex === index && (
//                 <>
//                   <div>
//                     <h3>Job Description:</h3>
//                     <p>{profile.jobDescription}</p>
//                   </div>
//                   <div>
//                     <p><strong>Job Posting Date:</strong> {profile.jobPostingDate}</p>
//                     <p><strong>Application Deadline:</strong> {profile.applicationDeadline}</p>
//                   </div>
//                   <button onClick={() => applyForJob(profile)} className="apply-button"> Apply </button>
//                 </>
//               )}
//             </div>
//           )) : <p>No jobs available</p>}
//         </div>
//       </div>

//       <div className="jobs-section">
//         <h1 className="section-heading">Jobs Online</h1>
//         <div className="job-list-container">
//           {companies.map((company) => (
//             <div key={company} className="job-dropdown">
//               <div className="dropdown-header" onClick={() => fetchOnlineJobs(company)}>
//                 {company.charAt(0).toUpperCase() + company.slice(1)} Jobs
//               </div>
//               {loadingCompany === company && <div className="loading-spinner">Loading...</div>}
//               {expandedCompany === company && onlineJobs[company]?.length > 0 && (
//                 <div className="job-list">
//                   <ul>
//                     {onlineJobs[company].map((job, index) => (
//                       <li key={index}>
//                         <a href={job.url} target="_blank" rel="noopener noreferrer">
//                           {job.title}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Jobs;

// import React, { useEffect, useState, useContext } from 'react';
// import { logincontext } from "../contexts/Logincontext";
// import axios from 'axios';
// import "./Connections.css";

// const Jobs = () => {
//   const [currentuser] = useContext(logincontext);
//   const [profiles, setProfiles] = useState([]);
//   const [onlineJobs, setOnlineJobs] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [expandedIndex, setExpandedIndex] = useState(null);
//   const [loadingCompany, setLoadingCompany] = useState(null);
//   const [expandedCompany, setExpandedCompany] = useState(null);
//   const [stream, setStream] = useState("");

//   const companies_computer_science = ["microsoft", "oracle"];
//   const companies_mechanical_engineer = ["Hyundai", "Hitachi"];
//   const companies_electrical_engineer = ["Siemens", "ABB"];

//   // Fetch the user's stream (degree)
//   useEffect(() => {
//     const fetchStream = async () => {
//       try {
//         const response = await axios.post('http://127.0.0.1:5000/get_degree', {
//           email: currentuser.email
//         });

//         setStream(response.data.degree || "");
//       } catch (error) {
//         console.error("Error fetching degree:", error);
//       }
//     };

//     fetchStream();
//   }, [currentuser.email]);

//   // Determine which companies to show based on the stream
//   let companies = [];
//   if (stream.includes("Computer Science")) {
//     companies = companies_computer_science;
//   } else if (stream.includes("Mechanical")) {
//     companies = companies_mechanical_engineer;
//   } else if (stream.includes("Electrical")) {
//     companies = companies_electrical_engineer;
//   }

//   useEffect(() => {
//     const fetchProfiles = async () => {
//       try {
//         const response = await axios.post('http://127.0.0.1:5000/jobrec', {
//           params: { email: currentuser.email }
//         });
//         const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
//         const formattedData = data.map(profile => ({
//           companyName: profile.company_name,
//           role: profile.role,
//           jobDescription: profile.job_description,
//           experienceRequired: profile.experience_required,
//           jobPostingDate: profile.job_posting_date,
//           applicationDeadline: profile.application_deadline,
//           location: profile.location,
//         }));
//         setProfiles(formattedData);
//       } catch (err) {
//         setError('Failed to fetch recommended jobs');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfiles();
//   }, [currentuser.email]);

//   const toggleDetails = (index) => {
//     setExpandedIndex(expandedIndex === index ? null : index);
//   };

//   const applyForJob = async (job) => {
//     const email = currentuser?.email;
//     if (!email) {
//       alert("User is not logged in.");
//       return;
//     }

//     try {
//       const response = await axios.post(`http://127.0.0.1:5000/applyjob`, {
//         email,
//         company: job.companyName,
//         role: job.role
//       });
//       alert(response.data.message);
//     } catch (error) {
//       console.error("Error applying for job:", error.response?.data || error.message);
//       alert("Failed to apply for job");
//     }
//   };

//   const fetchOnlineJobs = async (company) => {
//     if (expandedCompany === company) {
//       setExpandedCompany(null);
//       return;
//     }
    
//     setLoadingCompany(company);
//     try {
//       const response = await axios.post("http://127.0.0.1:5000/get-jobs", {
//         company,
//         email: currentuser?.email
//       });
//       setOnlineJobs(prev => ({ ...prev, [company]: response.data.jobs }));
//       setExpandedCompany(company);
//     } catch (error) {
//       console.error(`Error fetching ${company} jobs:`, error);
//       alert(`Failed to retrieve ${company} jobs`);
//     } finally {
//       setLoadingCompany(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Loading jobs...</p>
//       </div>
//     );
//   }

//   if (error) return <div>{error}</div>;

//   return (
//     <div className="jobs-container">
//       <div className="jobs-section">
//         <h1 className="section-heading">Recommended Jobs</h1>
//         <div className="profile-cards">
//           {profiles.length > 0 ? profiles.map((profile, index) => (
//             <div key={index} className="profile-card" onClick={() => toggleDetails(index)}>
//               <h2>{profile.companyName}</h2>
//               <p><strong>Role:</strong> {profile.role}</p>
//               <p><strong>Location:</strong> {profile.location}</p>
//               <p><strong>Experience Required:</strong> {profile.experienceRequired}</p>
//               {expandedIndex === index && (
//                 <>
//                   <div>
//                     <h3>Job Description:</h3>
//                     <p>{profile.jobDescription}</p>
//                   </div>
//                   <div>
//                     <p><strong>Job Posting Date:</strong> {profile.jobPostingDate}</p>
//                     <p><strong>Application Deadline:</strong> {profile.applicationDeadline}</p>
//                   </div>
//                   <button onClick={() => applyForJob(profile)} className="apply-button"> Apply </button>
//                 </>
//               )}
//             </div>
//           )) : <p>No jobs available</p>}
//         </div>
//       </div>

//       <div className="jobs-section">
//         <h1 className="section-heading">Jobs Online</h1>
//         <div className="job-list-container">
//           {companies.map((company) => (
//             <div key={company} className="job-dropdown">
//               <div className="dropdown-header" onClick={() => fetchOnlineJobs(company)}>
//                 {company.charAt(0).toUpperCase() + company.slice(1)} Jobs
//               </div>
//               {loadingCompany === company && <div className="loading-spinner">Loading...</div>}
//               {expandedCompany === company && onlineJobs[company]?.length > 0 && (
//                 <div className="job-list">
//                   <ul>
//                     {onlineJobs[company].map((job, index) => (
//                       <li key={index}>
//                         <a href={job.url} target="_blank" rel="noopener noreferrer">
//                           {job.title}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Jobs;
