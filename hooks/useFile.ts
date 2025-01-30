import { useState, useEffect } from "react";
import { liveQuery } from "dexie"; // Dexie's liveQuery for real-time updates
import db, { FileRecord } from "@/db/db"; // For managing subscriptions

export const useFiles = () => {
  const [files, setFiles] = useState<FileRecord[]>([]); // State to hold files
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const subscription = liveQuery(() => db.files.toArray()).subscribe({
      next: (updatedFiles) => {
        setFiles(updatedFiles);
        setLoading(false); // Stop loading when data is received
      },
      error: (err) => {
        console.error("Error in liveQuery subscription:", err);
        setError("Error fetching files from your local storage.");
        setLoading(false); // Stop loading even if there’s an error
      },
    });

    return () => subscription.unsubscribe();
  }, []);
  const deleteFile = async (fileId: string) => {
    try {
      await db.files.delete(fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Error deleting file.");
    }
  };
  const getFile = (fileId: string) => {
    return db.files.get(fileId);
  };
  return { files, loading, error, deleteFile, getFile }; // Return the files to the consuming component
};
