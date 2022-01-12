import React from 'react'

export default function TabStrip({ tabs, selectedTab, clickTab }) {
    const divStyle = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    };
    const tabStyle = {
        padding: "5px",
        backgroundColor: "#ccc",
        cursor: "pointer",
        flexGrow: "1",
        flexBasis: "0",
        textAlign: "center"
    };
    const selectedTabStyle = {
        padding: "5px",
        backgroundColor: "#8B008B",
        cursor: "pointer",
        color: "#ddd",
        flexGrow: "1",
        flexBasis: "0",
        textAlign: "center"
    };

    return (
        <div style={divStyle}>
            {tabs && tabs.map(tab => {
                function handleTabClick() {
                    clickTab && clickTab(tab);
                }
                return (
                    <div key={tab} style={tab === selectedTab ? selectedTabStyle : tabStyle} onClick={handleTabClick}>
                        {tab}
                    </div>
                )
            })}
        </div>
    );
}
