import React, { useState } from "react";

interface IUserFectched {
  $id: string;
  fullName?: string;
  userId?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  isVendor?: boolean;
}

interface UsersTabProps {
  users: IUserFectched[];
  loading: string;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredUsers: IUserFectched[];
  usersPerPage: number;
  currentUserId: string;
  handleAdminToggle: (userId: string, toAdmin: boolean) => void;
  handleDelete: (userId: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  filteredUsers,
  usersPerPage,
  currentUserId,
  handleAdminToggle,
  handleDelete,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserFectched | null>(null);
  const [modalType, setModalType] = useState<"confirm" | "vendor" | "self">(
    "confirm"
  );
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const openDeleteModal = (
    user: IUserFectched,
    type: "confirm" | "vendor" | "self"
  ) => {
    setSelectedUser(user);
    setModalType(type);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
    setModalType("confirm");
  };

  const confirmDelete = () => {
    if (selectedUser) {
      handleDelete(selectedUser.$id);
      showFeedback(
        "success",
        `User "${
          selectedUser.fullName || selectedUser.email
        }" has been deleted successfully.`
      );
    }
    closeDeleteModal();
  };

  const showFeedback = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setFeedbackMessage({ type, message });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleAdminToggleWithFeedback = (userId: string, toAdmin: boolean) => {
    const user = users.find((u) => u.$id === userId);
    handleAdminToggle(userId, toAdmin);

    if (user) {
      const action = toAdmin ? "promoted to Admin" : "removed from Admin role";
      showFeedback(
        "success",
        `${user.fullName || user.email} has been ${action}.`
      );
    }
  };

  if (loading === "pending")
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading users...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md">
          <svg
            className="w-12 h-12 text-red-600 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error: {error}
          </p>
        </div>
      </div>
    );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const adminUsersCount = filteredUsers.filter(
    (u) => u.isAdmin === true
  ).length;
  const vendorUsersCount = filteredUsers.filter(
    (u) => u.isVendor === true && u.isAdmin !== true
  ).length;
  const regularUsersCount = filteredUsers.filter(
    (u) => !(u.isAdmin || u.isVendor)
  ).length;

  const getRoleDisplay = (isAdmin: boolean, isVendor: boolean) => {
    if (isAdmin) return "Admin";
    if (isVendor) return "Vendor";
    return "User";
  };

  const getRoleColor = (isAdmin: boolean, isVendor: boolean) => {
    if (isAdmin) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    } else if (isVendor) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <>
      <div className="space-y-6">
        {/* Feedback Toast */}
        {feedbackMessage && (
          <div
            className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300 max-w-md`}
          >
            <div
              className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
                feedbackMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                  : feedbackMessage.type === "error"
                  ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex-shrink-0">
                {feedbackMessage.type === "success" ? (
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : feedbackMessage.type === "error" ? (
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    feedbackMessage.type === "success"
                      ? "text-green-800 dark:text-green-200"
                      : feedbackMessage.type === "error"
                      ? "text-red-800 dark:text-red-200"
                      : "text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {feedbackMessage.message}
                </p>
              </div>
              <button
                onClick={() => setFeedbackMessage(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Total Users
                </div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {filteredUsers.length}
                </div>
              </div>
              <svg
                className="w-8 h-8 text-orange-400 dark:text-orange-500 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Admins
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {adminUsersCount}
                </div>
              </div>
              <svg
                className="w-8 h-8 text-red-400 dark:text-red-500 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  Vendors
                </div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
                  {vendorUsersCount}
                </div>
              </div>
              <svg
                className="w-8 h-8 text-yellow-400 dark:text-yellow-500 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Regular Users
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {regularUsersCount}
                </div>
              </div>
              <svg
                className="w-8 h-8 text-blue-400 dark:text-blue-500 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Found {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "user" : "users"} matching "
              {searchTerm}"
            </p>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No users found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => {
                    const isCurrentUser = user.$id === currentUserId;
                    const toAdmin = !user.isAdmin;
                    const canToggle = toAdmin || !isCurrentUser;
                    const roleDisplay = getRoleDisplay(
                      Boolean(user.isAdmin),
                      Boolean(user.isVendor)
                    );
                    const roleColor = getRoleColor(
                      Boolean(user.isAdmin),
                      Boolean(user.isVendor)
                    );

                    return (
                      <tr
                        key={user.$id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold relative">
                              {(user.fullName ||
                                user.userId ||
                                "U")[0].toUpperCase()}
                              {isCurrentUser && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                  <svg
                                    className="w-2.5 h-2.5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.fullName || "N/A"}
                                </div>
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {user.email || "N/A"}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${roleColor}`}
                          >
                            {roleDisplay}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {canToggle && (
                              <button
                                onClick={() =>
                                  handleAdminToggleWithFeedback(
                                    user.$id,
                                    toAdmin
                                  )
                                }
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                  toAdmin
                                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                                }`}
                                title={
                                  toAdmin
                                    ? "Promote to Admin"
                                    : "Remove Admin privileges"
                                }
                              >
                                {toAdmin ? "Make Admin" : "Remove Admin"}
                              </button>
                            )}
                            {!canToggle && user.isAdmin && (
                              <span
                                className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 italic"
                                title="You cannot remove your own admin privileges"
                              >
                                Cannot modify
                              </span>
                            )}
                            <button
                              onClick={() => {
                                if (isCurrentUser) {
                                  openDeleteModal(user, "self");
                                } else if (user.isVendor) {
                                  openDeleteModal(user, "vendor");
                                } else {
                                  openDeleteModal(user, "confirm");
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                isCurrentUser
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                                  : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              }`}
                              disabled={isCurrentUser}
                              title={
                                isCurrentUser
                                  ? "You cannot delete your own account"
                                  : "Delete user"
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {(currentPage - 1) * usersPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.min(currentPage * usersPerPage, filteredUsers.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {filteredUsers.length}
              </span>{" "}
              users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                Previous
              </button>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                        currentPage === page
                          ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                          : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    modalType === "self"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {modalType === "self" ? (
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {modalType === "self"
                      ? "Cannot Delete Your Account"
                      : modalType === "vendor"
                      ? "Delete Vendor Account?"
                      : "Delete User Account?"}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    {modalType === "self" ? (
                      <>
                        <p>
                          You cannot delete your own account from the admin
                          dashboard for security reasons.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          If you need to delete your account, please contact
                          another administrator or support.
                        </p>
                      </>
                    ) : modalType === "vendor" ? (
                      <>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedUser.fullName || selectedUser.email}
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
                          <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                            ⚠️ Important Notice
                          </p>
                          <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                            This vendor has associated restaurants and menu
                            items. Before deleting:
                          </p>
                          <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 text-xs mt-2 space-y-1">
                            <li>Delete or reassign their restaurants</li>
                            <li>Remove or update menu items</li>
                            <li>Handle any pending orders</li>
                          </ul>
                        </div>
                        <p className="mt-2 text-red-600 dark:text-red-400 font-medium">
                          This action cannot be undone.
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          Are you sure you want to permanently delete this user?
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedUser.fullName ||
                            selectedUser.email ||
                            "this user"}
                        </p>
                        <p className="text-red-600 dark:text-red-400 font-medium mt-2">
                          This action cannot be undone.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeDeleteModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                {modalType !== "self" && (
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                  >
                    {modalType === "vendor" ? "Delete Vendor" : "Delete User"}
                  </button>
                )}
                {modalType === "self" && (
                  <button
                    onClick={closeDeleteModal}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Got It
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersTab;
