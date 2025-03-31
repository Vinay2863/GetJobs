// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./Connections.css";
// import { useNavigate } from "react-router-dom";

// const  AllAppliedJobs=()=> {
//     const [users, setUsers] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchAppliedJobs = async () => {
//             try {
//                 const response = await axios.get("http://localhost:5000/allapplied_jobs");
//                 setUsers(response.data);
//             } catch (err) {
//                 setError("Failed to fetch applied jobs");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAppliedJobs();
//     }, []);

//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <div className="spinner"></div>
//                 <p>Loading applied jobs...</p>
//             </div>
//         );
//     }

//     if (error) return <div>{error}</div>;

//     return (
//         <div className="p-6 max-w-6xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Applied Jobs</h2>
//             {Object.keys(users).length === 0 ? (
//                 <p className="text-gray-500 text-center">No job applications found.</p>
//             ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                     {Object.entries(users).map(([email, jobs]) => (
//                         <div key={email} className="p-4 border rounded-lg shadow-md bg-white">
//                             <h3 className="text-lg font-semibold text-blue-600">{email}</h3>
//                             <ul className="mt-2 space-y-2">
//                                 {jobs.map(job => (
//                                     <li key={job._id} className="p-2 bg-gray-100 rounded-md shadow-sm">
//                                         <strong className="block">{job.company}</strong>
//                                         <span className="text-gray-600">{job.role}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }


// export default AllAppliedJobs;


import React, { useEffect, useState, useContext } from "react";
import { logincontext } from "../contexts/Logincontext";
import axios from "axios";
import "./Connections.css";

const AllAppliedJobs = () => {
  const [currentuser] = useContext(logincontext);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const response = await axios.get(`http://localhost:5000/allapplied_jobs`);
        setAppliedJobs(response.data);
      } catch (err) {
        setError("Failed to fetch applied jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []); 

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applied jobs...</p>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div className="connections-container">
      <h1 className="connections-heading">Applied Jobs</h1>
      <div className="profile-cards">
        {appliedJobs.length > 0 ? (
          appliedJobs.map((job, index) => (
            <div key={index} className="profile-card">
              <h2>{job.company}</h2>
              <p><strong>Role:</strong> {job.role}</p>
            </div>
          ))
        ) : (
          <div>No jobs applied yet.</div>
        )}
      </div>
    </div>
  );
};

export default AllAppliedJobs;