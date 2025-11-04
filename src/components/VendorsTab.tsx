import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  User,
  Phone,
  Building,
  MapPin,
  Calendar,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { IVendorFetched } from "../../types/types";
import { Button } from "./ui/button";

interface VendorsTabProps {
  vendors: IVendorFetched[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "pending" | "approved" | "rejected" | "all";
  setStatusFilter: (status: "pending" | "approved" | "rejected" | "all") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredVendors: IVendorFetched[];
  vendorsPerPage: number;
  handleVendorStatusChange: (vendorId: string, newStatus: "pending" | "approved" | "rejected") => Promise<void>;
  handleVendorDelete: (vendorId: string) => Promise<void>;
  VENDOR_STATUSES: string[];
}

export default function VendorsTab({
  vendors,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  filteredVendors,
  vendorsPerPage,
  handleVendorStatusChange,
  handleVendorDelete,
  VENDOR_STATUSES,
}: VendorsTabProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  const [isDeletingVendor,setIsDeletingVendor] = useState<boolean>(false);

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

  const handleStatusChange = (vendorId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "pending" | "approved" | "rejected";
    handleVendorStatusChange(vendorId, newStatus);
  };

  const handleDelete = (vendorId: string) => {
    setVendorToDelete(vendorId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
      setIsDeletingVendor(true)
    if (vendorToDelete) {
      await handleVendorDelete(vendorToDelete);
    }
      setIsDeletingVendor(false)
    setShowDeleteModal(false);
    setVendorToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVendorToDelete(null);
  };

  return (
    <>
      {/* Vendors Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Vendor Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search vendors..."
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
              {VENDOR_STATUSES.map((status) => (
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

      {/* Vendors Content */}
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
          {/* Desktop Vendors Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-orange-100 dark:bg-orange-900/30">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Vendor
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Business
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Contact
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Location
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
                {vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <tr
                      key={vendor.$id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {vendor.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {vendor.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {vendor.businessName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vendor.category}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            {vendor.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            {vendor.location}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={getStatusBadge(vendor.status)}>
                          {vendor.status.charAt(0).toUpperCase() +
                            vendor.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <select
                            value={vendor.status}
                            onChange={(e) => handleStatusChange(vendor.$id, e)}
                            className="px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button
                            onClick={() => handleDelete(vendor.$id)}
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
                      colSpan={6}
                      className="py-8 text-center text-gray-500"
                    >
                      No vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Vendors View */}
          <div className="lg:hidden space-y-4">
            {vendors.length > 0 ? (
              vendors.map((vendor) => (
                <div
                  key={vendor.$id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {vendor.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {vendor.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {vendor.businessName} ({vendor.category})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {vendor.phoneNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {vendor.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {new Date(vendor.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status:
                      </span>
                      <span className={getStatusBadge(vendor.status)}>
                        {vendor.status.charAt(0).toUpperCase() +
                          vendor.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={vendor.status}
                        onChange={(e) => handleStatusChange(vendor.$id, e)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleDelete(vendor.$id)}
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
                No vendors found.
              </div>
            )}
          </div>

          {/* Vendors Pagination */}
          {filteredVendors.length > vendorsPerPage && (
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
                {Math.ceil(filteredVendors.length / vendorsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      currentPage + 1,
                      Math.ceil(filteredVendors.length / vendorsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredVendors.length / vendorsPerPage)
                }
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Next
              </button>
            </div>
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
                  Are you sure you want to delete this vendor? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                   {isDeletingVendor ? <Loader2 className="animate-spin"/>: " Delete"}
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