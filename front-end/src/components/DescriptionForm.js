//a large input text box for description

import React from "react";

export default function DescriptionForm({description, setDescription}) {
    
    
        return (
            <div className="w-full">
                <textarea
                className="w-full border border-gray-300 p-2 rounded-lg outline-none resize-none"
                placeholder="Enter description here..."
                rows={4}
                value={description}
                onChange={setDescription}
                />
          </div>
        );
    }