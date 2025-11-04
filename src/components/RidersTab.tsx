"use client";
import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  User,
  Phone,
  MapPin,
  Calendar,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { IRidersFetched } from "../../types/types";
import { Button } from "./ui/button";
import Link from "next/link";
import { fileUrl, validateEnv } from "@/utils/appwrite";

interface RidersTabProps {
  riders: IRidersFetched[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "pending" | "approved" | "rejected" | "all";
  setStatusFilter: (status: "pending" | "approved" | "rejected" | "all") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredRiders: IRidersFetched[];
  ridersPerPage: number;
  handleRiderStatusChange: (riderId: string, newStatus: "pending" | "approved" | "rejected") => Promise<void>;
  handleRiderDelete: (riderId: string) => Promise<void>;
  RIDER_STATUSES: string[];
}

export default function RidersTab({
  riders,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  filteredRiders,
  ridersPerPage,
  handleRiderStatusChange,
  handleRiderDelete,
  RIDER_STATUSES,
}: RidersTabProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState<string | null>(null);
  const [isDeletingRider, setIsDeletingRider] = useState<boolean>(false);
  const [selectedRider, setSelectedRider] = useState<IRidersFetched | null>(null);

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-block px-3 py-1 rounded-full text-xs font-semibold border";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
    }
  };

  const handleStatusChange = (riderId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as "pending" | "approved" | "rejected";
    handleRiderStatusChange(riderId, newStatus);
  };

  const handleDeleteClick = (e: React.MouseEvent, riderId: string) => {
    e.stopPropagation();
    setRiderToDelete(riderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeletingRider(true);
    if (riderToDelete) {
      await handleRiderDelete(riderToDelete);
    }
    setIsDeletingRider(false);
    setShowDeleteModal(false);
    setRiderToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRiderToDelete(null);
  };

  const handleRiderClick = (rider: IRidersFetched) => {
    setSelectedRider(rider);
  };

  const closeModal = () => {
    setSelectedRider(null);
  };

  return (
    <>
      {/* Riders Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Rider Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "pending" | "approved" | "rejected" | "all"
                )
              }
              className="w-full pl-10 pr-8 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none"
            >
              <option value="all">All Statuses</option>
              {RIDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Riders Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Desktop Riders Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-orange-100 dark:bg-orange-900/30">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Rider
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Phone
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Address
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {riders.length > 0 ? (
                  riders.map((rider) => (
                    <tr
                      key={rider.$id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition cursor-pointer"
                      onClick={() => handleRiderClick(rider)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {rider.fullName}
                            </p>
                            {rider.email && (
                              <p className="text-sm text-gray-500">
                                {rider.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            {rider.phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            {rider.address}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={getStatusBadge(rider.status)}>
                          {rider.status.charAt(0).toUpperCase() +
                            rider.status.slice(1)}
                        </span>
                      </td>
                      <td 
                        className="py-4 px-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <select
                            value={rider.status}
                            onChange={(e) => handleStatusChange(rider.$id, e)}
                            className="px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button
                            onClick={(e) => handleDeleteClick(e, rider.$id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-gray-500"
                    >
                      No riders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Riders View */}
          <div className="lg:hidden space-y-4">
            {riders.length > 0 ? (
              riders.map((rider) => (
                <div
                  key={rider.$id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 cursor-pointer"
                  onClick={() => handleRiderClick(rider)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {rider.fullName}
                      </p>
                      {rider.email && (
                        <p className="text-sm text-gray-500">{rider.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">{rider.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">{rider.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {new Date(rider.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status:
                      </span>
                      <span className={getStatusBadge(rider.status)}>
                        {rider.status.charAt(0).toUpperCase() +
                          rider.status.slice(1)}
                      </span>
                    </div>
                    <div 
                      className="flex flex-col sm:flex-row gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={rider.status}
                        onChange={(e) => handleStatusChange(rider.$id, e)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={(e) => handleDeleteClick(e, rider.$id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                No riders found.
              </div>
            )}
          </div>

          {/* Riders Pagination */}
          {filteredRiders.length > ridersPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Page {currentPage} of{" "}
                {Math.ceil(filteredRiders.length / ridersPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      currentPage + 1,
                      Math.ceil(filteredRiders.length / ridersPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredRiders.length / ridersPerPage)
                }
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Next
              </button>
            </div>
          )}

          {/* Rider Details Modal */}
          {selectedRider && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Rider Details
                </h3>
                <div className="space-y-4 mb-6">
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Full Name:
                    </span>{" "}
                    {selectedRider.fullName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Phone:
                    </span>{" "}
                    {selectedRider.phone}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Email:
                    </span>{" "}
                    {selectedRider.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Address:
                    </span>{" "}
                    {selectedRider.address}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </span>{" "}
                    <span className={getStatusBadge(selectedRider.status)}>
                      {selectedRider.status.charAt(0).toUpperCase() +
                        selectedRider.status.slice(1)}
                    </span>
                  </p>
                  {selectedRider.driversLicensePicture && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Driver's License:
                      </span>
                      <Link
                        href={fileUrl(
                          validateEnv().driversLicenceBucketId,
                          selectedRider.driversLicensePicture
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        View License
                      </Link>
                    </div>
                  )}
                </div>
                <Button
                  onClick={closeModal}
                  className="w-full"
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={cancelDelete}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Confirm Delete
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                  Are you sure you want to delete this rider? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={cancelDelete}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    {isDeletingRider ? <Loader2 className="animate-spin w-4 h-4" /> : "Delete"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </>
  );
}