"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { Employee } from '../utils/types';
import { fetchEmployeesThunk, deleteEmployeeThunk, updateEmployeeThunk } from '../redux/slices/employeeSlice';

const EmployeeList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, status } = useSelector((state: RootState) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedParentId, setUpdatedParentId] = useState<number | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  const handleUpdate = (employee: Employee) => {
    setSelectedEmployee(employee);
    setUpdatedName(employee.name);
    setUpdatedDescription(employee.description || '');
    setUpdatedParentId(employee.parentId);
    setShowUpdateModal(true);
  };

  const handleDelete = (id: number) => {
    setEmployeeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete !== null) {
      dispatch(deleteEmployeeThunk(employeeToDelete));
    }
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setShowUpdateModal(false);
    setUpdatedName('');
    setUpdatedDescription('');
    setUpdatedParentId(undefined);
    setSuccessMessage(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setUpdatedName(value);
    } else if (name === 'description') {
      setUpdatedDescription(value);
    } else if (name === 'parentId') {
      setUpdatedParentId(parseInt(value, 10) || undefined);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (selectedEmployee) {
      const updatedEmployee: Employee = {
        ...selectedEmployee,
        name: updatedName,
        description: updatedDescription,
        parentId: updatedParentId,
      };
      await dispatch(updateEmployeeThunk(updatedEmployee));
      setSuccessMessage('Employee updated successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      handleCloseModal();
    }
    setIsSubmitting(false);
  };

  if (status === 'loading') {
    return <div className="text-center">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="text-center text-red-500">Failed to load employees</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Employee List</h2>
      <ul className="space-y-4">
        {employees.map((emp: Employee) => (
          <li key={emp.id} className="flex justify-between items-center p-4 border border-gray-300 rounded-md text-black">
            <span>{emp.name}</span>
            <div>
              <button 
                onClick={() => handleUpdate(emp)} 
                className="bg-blue-500 py-1 px-3 rounded-md mr-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Update
              </button>
              <button 
                onClick={() => handleDelete(emp.id)} 
                className="bg-red-500 py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showUpdateModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Update Employee</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={updatedName} 
                  onChange={handleChange} 
                  className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={updatedDescription} 
                  onChange={handleChange} 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300  text-black rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">Parent ID</label>
                <input 
                  type="number" 
                  id="parentId" 
                  name="parentId" 
                  value={updatedParentId || ''} 
                  onChange={handleChange} 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300  text-black rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="mr-2 bg-gray-300 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
              {successMessage && <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">{successMessage}</div>}
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-black font-bold mb-4">Confirm Delete</h2>
            <p className=' text-black'>Are you sure you want to delete this employee?</p>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="mr-2 bg-gray-300 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
              >
                No
              </button>
              <button 
                onClick={confirmDelete} 
                className="bg-red-500 text-black py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
