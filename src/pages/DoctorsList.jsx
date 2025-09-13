import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../services/api';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAvatarFallback, formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAllDoctors();
      setDoctors(response.data.data.doctors);
    } catch (error) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading doctors..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Doctors</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and view all registered doctors
        </p>
      </div>

      {/* Empty State */}
      {doctors.length === 0 ? (
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">
                No doctors have registered in the system yet.
              </p>
            </div>
          </Card.Content>
        </Card>
      ) : (
        /* Doctors Grid */
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow duration-200">
              <Card.Content className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {doctor.profile_picture ? (
                          <img
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            src={`http://localhost:5000${doctor.profile_picture}`}
                            alt={doctor.name}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                            <span className="text-blue-600 font-semibold text-sm">
                              {getAvatarFallback(doctor.name)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {doctor.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Employee ID
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {doctor.employee_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Department
                        </div>
                        <div className="text-sm text-gray-900">
                          {doctor.department || 'Not specified'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Contact
                        </div>
                        <div className="text-sm text-gray-900">
                          {doctor.phone || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Joined
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatDate(doctor.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
