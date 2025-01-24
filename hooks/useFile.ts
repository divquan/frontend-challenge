import { useState, useEffect } from "react";
import { liveQuery } from "dexie"; // Dexie's liveQuery for real-time updates
import db, { FileRecord } from "@/db/db"; // For managing subscriptions

export const useFiles = () => {
  const [files, setFiles] = useState<FileRecord[]>([]); // State to hold files

  useEffect(() => {
    // Create a subscription to listen for real-time updates
    const subscription = liveQuery(() => db.files.toArray()).subscribe({
      next: (updatedFiles) => {
        setFiles(updatedFiles); // Update the state with the latest files
      },
      error: (err) => {
        console.error("Error in liveQuery subscription:", err);
      },
    });

    // Cleanup the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  return files; // Return the files to the consuming component
};
