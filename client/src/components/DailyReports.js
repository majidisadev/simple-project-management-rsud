import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  getReportsByDateRange,
  createReport,
  updateReport,
  deleteReport,
  searchReports,
} from '../services/reports';

const DailyReports = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper function to format date to YYYY-MM-DD without timezone issues
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to create date from YYYY-MM-DD string without timezone issues
  const parseDateFromInput = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const response = await getReportsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  const getReportsForDate = (date) => {
    const dateStr = date.toDateString();
    return reports.filter(
      (report) => new Date(report.date).toDateString() === dateStr
    );
  };

  const getReportForDate = (date) => {
    const reportsForDate = getReportsForDate(date);
    return reportsForDate.length > 0 ? reportsForDate[0] : null;
  };

  const isOwnReport = (report) => {
    return report.user?._id === user.id || report.user === user.id;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentReport(null);
    setReportContent({ title: '', content: '' });
  };

  const handleViewReport = (report) => {
    setCurrentReport(report);
    setReportContent({ title: report.title || '', content: report.content });
    setIsModalOpen(true);
  };

  const handleAddReport = () => {
    setCurrentReport(null);
    setReportContent({ title: '', content: '' });
    setIsModalOpen(true);
  };

  const handleSaveReport = async () => {
    if (!reportContent.content.trim()) {
      alert('Please enter report content');
      return;
    }

    // Check if trying to edit someone else's report
    if (currentReport && !isOwnReport(currentReport)) {
      alert('You can only edit your own reports');
      return;
    }

    setLoading(true);
    try {
      // Create date in local timezone (midnight) to avoid timezone issues
      const dateForSave = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      if (currentReport && isOwnReport(currentReport)) {
        await updateReport(currentReport._id, {
          ...reportContent,
          date: dateForSave.toISOString(),
        });
      } else {
        await createReport({
          ...reportContent,
          date: dateForSave.toISOString(),
        });
      }
      setIsModalOpen(false);
      loadReports();
      setCurrentReport(null);
      setReportContent({ title: '', content: '' });
    } catch (error) {
      console.error('Error saving report:', error);
      alert(error.response?.data?.message || 'Error saving report');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (report = null) => {
    const reportToDelete = report || currentReport;
    if (!reportToDelete) return;
    
    if (!isOwnReport(reportToDelete)) {
      alert('You can only delete your own reports');
      return;
    }

    try {
      await deleteReport(reportToDelete._id);
      if (currentReport?._id === reportToDelete._id) {
        setIsModalOpen(false);
        setCurrentReport(null);
        setReportContent({ title: '', content: '' });
      }
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(error.response?.data?.message || 'Error deleting report');
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const report = getReportForDate(date);
      if (report) {
        return (
          <div className="h-1 w-1 bg-blue-500 rounded-full mx-auto mt-1"></div>
        );
      }
    }
    return null;
  };

  const handleSearch = async (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword || keyword.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchReports(keyword);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching reports:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (report) => {
    const reportDate = new Date(report.date);
    setSelectedDate(reportDate);
    setSearchKeyword('');
    setSearchResults([]);
    // Scroll to calendar if needed
    setTimeout(() => {
      const calendarElement = document.querySelector('.react-calendar');
      if (calendarElement) {
        calendarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Reports</h1>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari report berdasarkan keyword..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
          </div>

          {/* Search Results */}
          {searchKeyword && (
            <div className="mt-3 max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-4 text-gray-500">Mencari...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-2">
                    {searchResults.length} hasil ditemukan
                  </p>
                  {searchResults.map((report) => (
                    <div
                      key={report._id}
                      onClick={() => handleSearchResultClick(report)}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {report.title || 'Untitled'}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(report.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        By: {report.user?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {report.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada hasil ditemukan
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <button
              onClick={handleAddReport}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              + Add Report
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getReportsForDate(selectedDate).length > 0 ? (
              getReportsForDate(selectedDate).map((report) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {report.title || 'Untitled'}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">
                        By: {report.user?.username || 'Unknown'}
                        {isOwnReport(report) && (
                          <span className="ml-2 text-blue-600">(Your report)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {report.content}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      View
                    </button>
                    {isOwnReport(report) && (
                      <>
                        <button
                          onClick={() => handleViewReport(report)}
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this report?')) {
                              handleDeleteReport(report);
                            }
                          }}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No reports for this date. Click "Add Report" to create one.
              </p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentReport && isOwnReport(currentReport) ? 'Edit Report' : currentReport ? 'View Report' : 'Add Report'}
            </h2>
            {currentReport && !isOwnReport(currentReport) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  This report belongs to {currentReport.user?.username || 'another user'}. You can only edit or delete your own reports.
                </p>
              </div>
            )}
            {(currentReport && isOwnReport(currentReport)) || !currentReport ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    onChange={(e) => setSelectedDate(parseDateFromInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={reportContent.title}
                    onChange={(e) =>
                      setReportContent({ ...reportContent, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={reportContent.content}
                    onChange={(e) =>
                      setReportContent({ ...reportContent, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="6"
                    placeholder="Enter report content"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setReportContent({ title: '', content: '' });
                      setCurrentReport(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReport}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Title:</p>
                  <p className="font-medium">{currentReport.title || 'Untitled'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Content:</p>
                  <p className="text-gray-800">{currentReport.content}</p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReports;

