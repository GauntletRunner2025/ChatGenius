
import React from 'react';

const MainContent: React.FC = () => {
    return (
        <div className="main-content">
            <div className="tabs">
                {/* Tabs for Chat, Files, Search */}
                <button>Chat</button>
                <button>Files</button>
                <button>Search</button>
            </div>
            <div className="tab-content">
                {/* Tab content goes here */}
                <div className="chat-content">Chat Content</div>
                <div className="files-content">Files Content</div>
                <div className="search-content">Search Content</div>
            </div>
        </div>
    );
};

export default MainContent;