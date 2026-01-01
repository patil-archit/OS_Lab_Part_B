import React from 'react';

const Barcode = ({ className = "h-12 w-auto" }) => {
    return (
        <svg className={className} viewBox="0 0 100 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" width="2" height="20" />
            <rect x="4" width="1" height="20" />
            <rect x="7" width="3" height="20" />
            <rect x="12" width="1" height="20" />
            <rect x="15" width="2" height="20" />
            <rect x="19" width="4" height="20" />
            <rect x="25" width="1" height="20" />
            <rect x="28" width="1" height="20" />
            <rect x="31" width="3" height="20" />
            <rect x="36" width="1" height="20" />
            <rect x="39" width="2" height="20" />
            <rect x="43" width="1" height="20" />
            <rect x="46" width="4" height="20" />
            <rect x="52" width="1" height="20" />
            <rect x="55" width="2" height="20" />
            <rect x="59" width="3" height="20" />
            <rect x="64" width="1" height="20" />
            <rect x="67" width="2" height="20" />
            <rect x="71" width="1" height="20" />
            <rect x="74" width="3" height="20" />
            <rect x="79" width="1" height="20" />
            <rect x="82" width="4" height="20" />
            <rect x="88" width="1" height="20" />
            <rect x="91" width="2" height="20" />
            <rect x="95" width="1" height="20" />
            <rect x="98" width="2" height="20" />
        </svg>
    );
};

export default Barcode;
