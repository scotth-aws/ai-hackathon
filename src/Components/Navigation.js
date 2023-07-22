import { SideNavigation, SpaceBetween, Badge, Container, ButtonDropdown, Box } from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";



const Navigation = (current_user) => {
    console.log('Navigation called');
    const User = current_user.User;

    console.log('Navigation ' + JSON.stringify(User));

    const [NavigationItems, setNavigationItems] = useState([]);

    let navigation_items = [];


    if (User.isLoggedIn) {

        navigation_items.push({
            type: "section",
            text: "User logged in",
            expanded: true,
            items: [{ type: "link", text: 'username ' + User.username, href: "#" }]
        });
        if (User.isOperator) {

            navigation_items.push({
                type: "section",
                text: "Students",
                expanded: true,
                items: [
                    { type: "link", text: "Generated Lecture Summaries", href: "/Home" },
                    { type: "link", text: "Generated Questions From Lectures", href: "/Questions" }

                ]
            });
            navigation_items.push({
                type: "section",
                text: "Faculty",
                expanded: true,
                items: [
                    { type: "link", text: "Upload Lectures", href: "/Upload" }

                ]
            });




        }
        
    }



    useEffect(() => {
        setNavigationItems(navigation_items);

    }, [User]);

    return (

        <SpaceBetween direction="vertical" size="l">
            <SideNavigation activeHref={0} items={NavigationItems} />
        </SpaceBetween>
    );
};

export default Navigation;
