"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import toast from "react-hot-toast";
import { databases, validateEnv } from "@/utils/appwrite";

export default function NewsletterAdminPage() {
  const { user, role } = useAuth();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchSubscribers() {
      setFetching(true);
      try {
        const { newsLetterCollectionId, databaseId } = validateEnv();
        const response = await databases.listDocuments(databaseId, newsLetterCollectionId);
        const emailList = response.documents.map((doc: any) => doc.email).filter(Boolean);
        setEmails(emailList);
      } catch (err) {
        toast.error("Failed to fetch subscribers");
      } finally {
        setFetching(false);
      }
    }
    fetchSubscribers();
  }, []);

  if (!user?.isAdmin || role !== "admin") {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center text-red-500 font-semibold text-lg">
        Access denied. Admins only.
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      toast.error("Subject and content are required.");
      return;
    }
    if (emails.length === 0) {
      toast.error("No subscribers to send to.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, emails }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Newsletter sent to ${data.sent} subscribers!`);
        setSubject("");
        setContent("");
      } else {
        toast.error(data.error || "Failed to send newsletter.");
      }
    } catch (err) {
      toast.error("Failed to send newsletter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-400">Send Newsletter</h1>
      <div className="mb-4">
        {fetching ? (
          <div className="text-gray-500">Loading subscribers...</div>
        ) : (
          <div className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            Sending mail to <span className="text-orange-600 dark:text-orange-400">{emails.length}</span> subscriber{emails.length !== 1 ? "s" : ""}.
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content (HTML allowed)</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || fetching}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Sending...
            </>
          ) : (
            "Send Newsletter"
          )}
        </button>
      </form>
    </div>
  );
} 