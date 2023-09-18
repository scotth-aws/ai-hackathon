import React, { useState, useEffect } from "react";
import "./index.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { appLayoutLabels } from "../labels";
import {
    AppLayout,
    Box,
    Header,
    HelpPanel,
    Button,
    Alert,
    Container,
    TextContent,
    Cards,
    TextFilter,
    Table,
    Pagination,
    CollectionPreferences,
    ColumnLayout,
    Modal,
    Icon,
    SpaceBetween,
    RadioGroup

} from "@cloudscape-design/components";
import Navigation from "../Navigation";
import {
    Logger,
    Auth,
    API,
    graphqlOperation,
    Storage,
    Amplify

} from "aws-amplify";

import { listHackathonLectureSummaries, getHackathonLectureSummary } from "../../graphql/queries.js";
import { onCreateHackathonLectureSummary } from "../../graphql/subscriptions.js";
import awsconfig from "../../aws-exports";

Amplify.configure(awsconfig);
Storage.configure({
    AWSS3: {
        bucket: 'scotth-outputs-genaihackathon23',
        region: 'us-west-2',
        level: "public",
        customPrefix: {
            public: "",
        },
    },
});


const logger = new Logger("erdLogger", "DEBUG");
const Content = (state) => {
    var items = state.completedItems;
    if (process.env.NODE_ENV === 'development')
        console.log("state completedItems " + state.completedItems);
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [filteringText, setFilteringText] = useState("");
    const [summaryOutput, setSummaryOutput] = useState("");
    var [itemSet, setItemSet] = useState(items);
    const [pagesCount, setPagesCount] = React.useState(
        Math.ceil(items.length / 5)
    );
    const [alertColor, setAlertColor] = React.useState("blue");
    const [radioGroupValue, setRadioGroupValue] = React.useState("English");
    const [visible, setVisible] = React.useState(false);


    const setMatches = (detail) => {
        setCurrentPageIndex(detail.currentPageIndex);
    };

    const selectionChangeButton = (detail) => {
        if (process.env.NODE_ENV === 'development')
            console.log("selectionChangeButton HIT " + JSON.stringify(detail.selectedItems));
        setSelectedItems(detail.selectedItems);
        if (detail.selectedItems.length === 0) {
            setDeleteDisabled(true);
            setSelectedItemsOutputs([]);
            //setSelectedItems(detail.selectedItems);
            return;
        } else {
            setDeleteDisabled(false);
        }

    };
    const [deploymentHeader, setDeploymentHeader] = useState(
        "Lecture Summary"
    );
    const [preferences, setPreferences] = React.useState({
        pageSize: 10,
        wrapLines: true,
        visibleContent: ["lectureTitle", "createdAt",]
    });
    const [selectedItemsOutputs, setSelectedItemsOutputs] = React.useState([]);
    const [deleteDisabled, setDeleteDisabled] = useState(true);
    const [alertVisible, setAlertVisible] = React.useState(false);


    const dismissAlert = (event) => {
        setAlertVisible(false);
        window.location.reload(false);
    }

    const modalExit = () => {

        setVisible(false)

    }
    function convertEpochToSpecificTimezone(timeEpoch, offset) {
        //Convert epoch to human readable date
        var myDate = new Date(timeEpoch * 1000);
        var hr = myDate.toGMTString();
        console.log(' human readable ' + hr)
        return hr;
    }
    const selectLanguage = async (event) => {
        setVisible(false);
    
        var folder = "summaries/english/"
        if (radioGroupValue !== 'English') {
            folder = "summaries/spanish/"
        }

        try {
           
            const result = await Storage.get(folder + selectedItems[0].lectureSummaryS3Url, { download: true });

            // data.Body is a Blob
            result.Body.text().then((string) => {
                // handle the String data return String
                console.log('s3 body ' + string);
                setSummaryOutput(string);
            });
        } catch (err) {
            console.log('get error ' + err);
        }
    }

    const getSummary = (event) => {
        console.log("****** getSelectedItem " + selectedItems[0].id);
        setVisible(true);
        if (process.env.NODE_ENV === 'development') {
            //console.log("getSummary " + JSON.stringify(event));

        }

    }

    //console.log('items ' + JSON.stringify(items));



    const search = (detail) => {

        var searchString = detail.filteringText;

        setFilteringText(searchString);

        if (searchString.length > 2) {



            let narray = [];
            for (var i = 0; i < items.length; i++) {

                if (items[i].lectureTitle.includes(searchString)) {
                    if (process.env.NODE_ENV === 'development')
                        console.log("HIT ");
                    narray.push(items[i]);


                } else {
                    if (process.env.NODE_ENV === 'development')
                        console.log("MISS ");

                }
            }
            if (process.env.NODE_ENV === 'development')
                console.log(narray.length);


            setItemSet(narray);

        } else if (searchString.length === 0) {
            if (process.env.NODE_ENV === 'development')
                console.log("RESET");

            setItemSet(items.slice((currentPageIndex - 1) * 5, currentPageIndex * 5));
        }



    }
    useEffect(() => {
        API.graphql({
            query: onCreateHackathonLectureSummary,

        }).subscribe({
            next: (data) => {

                if (process.env.NODE_ENV === 'development')
                    console.log(
                        "onCreateHackathonLectureSummary event " +
                        JSON.stringify(data.value.data.onCreateHackathonLectureSummary)
                    );

                //alert('Lecture Summaries Updated');
                setAlertVisible(true);


            },
        });
    }, [items]);



    return (

        <div id="top" >

            <Alert
                dismissible
                visible={alertVisible}
                statusIconAriaLabel="Success"
                onDismiss={() => dismissAlert()}
                type="success"    >
                Lecture Summaries Updated
            </Alert>

            <div className="container">

                <br />
                <Table
                    onSelectionChange={({ detail }) => selectionChangeButton(detail)}
                    selectedItems={selectedItems}
                    ariaLabels={{
                        selectionGroupLabel: "Items selection",
                        allItemsSelectionLabel: ({ selectedItems }) =>
                            `${selectedItems.length} ${selectedItems.length === 1 ? "item" : "items"
                            } selected`,
                        itemSelectionLabel: ({ selectedItems }, item) => {
                            const isItemSelected = selectedItems.filter(
                                (i) => i.createdAt === item.createdAt
                            ).length;
                            return `${item.createdAt} is ${isItemSelected ? "" : "not"
                                } selected`;
                        },
                    }}
                    columnDefinitions={[
                        {
                            id: "lectureTitle",
                            header: "Lecture Title",
                            cell: (e) => e.lectureTitle,
                            sortingField: "lectureTitle",
                        },
                        {
                            id: "createdAt",
                            header: "Created Date",
                            cell: (e) => convertEpochToSpecificTimezone(e.createdAt),
                        },
                        {
                            id: "lectureSummaryS3Url",
                            header: "S3 Location",
                            cell: (e) => e.lectureSummaryS3Url,
                        },

                        {
                            id: "accountid",
                            header: "Account Id",
                            cell: (e) => e.aid,
                            sortingField: "accountid",
                        },
                    ]}
                    items={itemSet}
                    loadingText="Loading resources"
                    selectionType="single"
                    trackBy="createdAt"
                    visibleColumns={[
                        "lectureTitle",
                        "createdAt",


                    ]}
                    empty={
                        <Box textAlign="center" color="inherit">

                            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                                No Summaries to display.
                            </Box>
                        </Box>
                    }
                    filter={
                        <TextFilter
                            size="s"
                            filteringPlaceholder="Find Lecture Summaries"
                            filteringText={filteringText}
                            onChange={({ detail }) => search(detail)}
                        />
                    }
                    header={
                        <ColumnLayout columns={2}>
                            <Header

                            >
                                Lecture Summaries
                            </Header>
                            <Button
                                variant="primary"
                                disabled={deleteDisabled}
                                onClick={(event) => getSummary(event)}
                            >
                                Get Summary
                            </Button>

                        </ColumnLayout>
                    }
                    pagination={
                        <Pagination
                            currentPageIndex={currentPageIndex}
                            onChange={({ detail }) => setMatches(detail)}
                            pagesCount={pagesCount}
                            ariaLabels={{
                                nextPageLabel: "Next page",
                                previousPageLabel: "Previous page",
                                pageLabel: (pageNumber) => `Page ${pageNumber} of all pages`,
                            }}
                        />
                    }
                    preferences={
                        <CollectionPreferences
                            onConfirm={({ detail }) => setPreferences(detail)}
                            title="Preferences"
                            confirmLabel="Confirm"
                            cancelLabel="Cancel"
                            preferences={{
                                pageSize: 10,
                                visibleContent: [
                                    "Lecture Title",
                                    "createdAt",


                                ],
                            }}
                            pageSizePreference={{
                                title: "Select page size",
                                options: [
                                    { value: 10, label: "10 resources" },
                                    { value: 20, label: "20 resources" },
                                ],
                            }}
                            visibleContentPreference={{
                                title: "Select visible content",
                                options: [
                                    {
                                        label: "Main distribution properties",
                                        options: [
                                            { id: "lectureTitle", label: "Lecture Title" },
                                            {
                                                id: "createdAt",
                                                label: "Created At",
                                                editable: false,
                                            },
                                            {
                                                id: "lectureSummaryS3Url",
                                                label: "S3 Location",
                                                editable: false,
                                            },
                                            { id: "accountid", label: "Account Id" },
                                        ],
                                    },
                                ],
                            }}
                        />
                    }
                />
            </div>


            <br />
            <div className="outputContainer">

                <Cards
                    cardDefinition={{
                        sections: [
                            {
                                id: "outputs",
                                content: (item) =>
                                    item.lectureTitle.substring(1, 4) !== "ttp" ? (
                                        <React.Fragment>
                                            <TextContent>{item.lectureTitle}</TextContent>


                                        </React.Fragment>
                                    ) : (
                                        <React.Fragment>
                                            <TextContent>{item.lectureTitle}</TextContent>

                                        </React.Fragment>
                                    ),
                            },
                        ],
                    }}
                    cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 2 }]}
                    items={selectedItemsOutputs}
                    loadingText="Loading resources"
                    empty={
                        <Box textAlign="center" color="inherit">
                            <Box padding={{ bottom: "s" }} variant="p" color="inherit">

                            </Box>
                        </Box>
                    }
                    header={<Header variant="h2" description={summaryOutput}>Summary Output</Header>}
                />


            </div>
            <Box>
                <Modal
                    onDismiss={() => modalExit()}
                    visible={visible}
                    closeAriaLabel="Close modal"
                    footer={
                        <Box float="right">
                            <SpaceBetween direction="horizontal" size="xs"></SpaceBetween>
                        </Box>
                    }
                    header="Select Summary Language"
                >
                    <SpaceBetween direction="vertical" size="l">
                        <RadioGroup
                            onChange={({ detail }) => setRadioGroupValue(detail.value)}
                            value={radioGroupValue}
                            items={[
                                { value: "English", label: "English" },
                                { value: "Spanish", label: "Spanish" }
                            ]} />



                        <Button
                            variant="primary"
                            disabled={deleteDisabled}
                            onClick={(event) => selectLanguage(event)}

                        >
                            Select
                        </Button>
                    </SpaceBetween>
                </Modal>
            </Box>

        </div>
    );

};

const SideHelp = () => (
    <HelpPanel
        footer={
            <div>
                <h3>
                    Learn more <Icon name="external" />
                </h3>
                <ul>

                    <li>
                        <a href="https://aws.amazon.com/pm/sagemaker/?trk=8987dd52-6f33-407a-b89b-a7ba025c913c&sc_channel=ps&s_kwcid=AL!4422!3!532502995192!e!!g!!aws%20sagemaker&ef_id=CjwKCAiA-dCcBhBQEiwAeWidtWI7aFvzG9hpRKt9RKhBuuJGBwF6irH7RpwxPvuC1Ch9hMb9EDjLfxoC-BkQAvD_BwE:G:s&s_kwcid=AL!4422!3!532502995192!e!!g!!aws%20sagemaker" target="_blank" rel="noreferrer">
                            Amazon Sagemaker
                        </a>
                    </li>


                </ul>
            </div>
        }
        header={<h2>Lecture Summary Help</h2>}
    >
        <div>

            <h3>From here you can :</h3>
            <ul>
                <li>
                    View the Lecture Summaries.
                </li>
                <li>
                    Select Summary to download and view.
                </li>

            </ul>


        </div>
    </HelpPanel>
);

function Home() {
    const [User, setUser] = useState({});
    const [completedItems, setCompletedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    if (process.env.NODE_ENV === 'development')
        console.log('The Home setup begins ---------->');
    var filterItems = [];
    useEffect(() => {
        if (process.env.NODE_ENV === 'development')
            console.log('useEffect called .  .  .');

        let current_user = {};
        try {
            current_user = {
                isLoggedIn: false,
                isOperator: true,
                isAdmin: false,
                username: "",
                token: "",
            };
            // get the current authenticated user object
            Auth.currentAuthenticatedUser({
                bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
            })
                .then((user) => {
                    current_user.isLoggedIn = true;
                    current_user.username = user.username;
                    current_user.token = user.signInUserSession.idToken["jwtToken"];
                    if (process.env.NODE_ENV === 'development')
                        console.log('Auth.currentAuthenticatedUser called current user is ' + user.username);
                    if (
                        user.signInUserSession.idToken.payload["cognito:groups"] !==
                        undefined
                    )
                        current_user.isAdmin = true;

                    //if (process.env.NODE_ENV === 'development')
                    //console.log('API.graphql(graphqlOperation(listHackathonLectureSummaries, searchObject)) being called  .  .  . ');

                    const costObject = { id: "myId" };
                    API.graphql(graphqlOperation(listHackathonLectureSummaries, {})).then((response, error) => {

                        //console.log('listHackathonLectureSummaries ' + JSON.stringify(response.data.listHackathonLectureSummaries.items));
                        // Declare a new array
                        let newArray = [];

                        // Declare an empty object
                        let uniqueObject = {};

                        if (response.data.listHackathonLectureSummaries === null) {

                            console.log('null');
                        } else {
                            console.log(response.data.listHackathonLectureSummaries);


                            // Loop for the array elements
                            for (let i in response.data.listHackathonLectureSummaries.items) {

                                // Extract the title
                                var objTitle = response.data.listHackathonLectureSummaries.items[i]['lectureTitle'];

                                // Use the title as the index
                                uniqueObject[objTitle] = response.data.listHackathonLectureSummaries.items[i];
                            }

                            // Loop to push unique object into array
                            for (var i in uniqueObject) {
                                newArray.push(uniqueObject[i]);
                            }

                            // Display the unique objects
                            console.log('************* ' + newArray);
                        }

                        //setCompletedItems(response.data.listHackathonLectureSummaries.items);
                        setCompletedItems(newArray);

                        setUser(current_user);
                        setIsLoading(false);

                    })



                })
                .catch(
                    (err) => {
                        setIsLoading(false);
                        if (process.env.NODE_ENV === 'development')
                            console.log("Home -> index.jsx - Auth error " + JSON.stringify(err), Date.now())

                    });
        } catch (e) {
            setIsLoading(false);
            if (process.env.NODE_ENV === 'development')
                console.log(JSON.stringify(e));
            //logger.info("Home -> index.jsx - useEffect error " + JSON.stringify(e), Date.now());
        } finally {
            if (process.env.NODE_ENV === 'development')
                console.log("finally");

        }
    }, []);
    if (process.env.NODE_ENV === 'development')
        console.log("After useEffect ");

    const [lnavopen, setLnavopen] = useState(true);
    const [rnavopen, setRnavopen] = useState(false);


    const navChange = (detail) => {
        setLnavopen(detail.open)
    }
    const toolsChange = (detail) => {
        setRnavopen(detail.open)
    }

    if (!isLoading) {
        return (
            <AppLayout
                disableContentPaddings={false}
                navigation={<Navigation User={User} />}
                content={<Content User={User} completedItems={completedItems} />}
                contentType="default"
                tools={<SideHelp />}
                toolsOpen={rnavopen}
                toolsWidth={350}
                navigationOpen={lnavopen}
                onNavigationChange={({ detail }) => navChange(detail)}
                onToolsChange={({ detail }) => toolsChange(detail)}
                ariaLabels={appLayoutLabels}
            />
        );
    } else {
        return (
            <Container>
                <TextContent>Loading . . . </TextContent>
            </Container>
        );
    }
}

export default withAuthenticator(Home);
