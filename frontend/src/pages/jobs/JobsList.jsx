// src/pages/jobs/JobsList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs } from '../../JS/actions/AdminAction';

const JobsList = () => {
  const dispatch = useDispatch();
  const { jobs = [], isLoadJob } = useSelector(state => state.adminReducer);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  if (isLoadJob) {
    return <div>Chargement des jobs...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Liste des Jobs</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h3>{job.title}</h3>
              <p><strong>Description:</strong> {job.description}</p>
              {job.company && <p><strong>Entreprise:</strong> {job.company}</p>}
              {job.location && <p><strong>Localisation:</strong> {job.location}</p>}
              {job.salary && <p><strong>Salaire:</strong> {job.salary}</p>}
              {job.requirements && <p><strong>Requirements:</strong> {job.requirements}</p>}
            </div>
          ))
        ) : (
          <p>Aucun job trouvé</p>
        )}
      </div>
    </div>
  );
};

export default JobsList;