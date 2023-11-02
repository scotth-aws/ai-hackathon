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
    Input,
    Form,
    FormField,
    SpaceBetween,
    Spinner


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

import { listHackathonLectureSummaries, genQuestions } from "../../graphql/queries.js";
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
    const [inputValue, setInputValue] = React.useState("What are reactions that happen with oxygen and carbon containing matter?");
    const [inputValueDisabled, setInputValueDisabled] = React.useState(true);
    const [inputSubmitButtonDisabled, setInputSubmitButtonDisabled] = React.useState(true);
    const [answer, setAnswer] = React.useState([]);
    const [spinnerVisible, setSpinnerVisible] = React.useState(false);
    var [formattedText, setFormattedText] = React.useState([]);
    const [deploymentHeader, setDeploymentHeader] = useState(
        "Lecture Summary"
    );
    const [preferences, setPreferences] = React.useState({
        pageSize: 10,
        wrapLines: true,
        visibleContent: ["lectureTitle", "createdAt",]
    });
    const [selectedItemsOutputs, setSelectedItemsOutputs] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [deleteDisabled, setDeleteDisabled] = useState(true);
    const [alertVisible, setAlertVisible] = React.useState(false);


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



    const dismissAlert = (event) => {
        setAlertVisible(false);
    }

    function convertEpochToSpecificTimezone(timeEpoch, offset) {
        //Convert epoch to human readable date
        var myDate = new Date(timeEpoch * 1000);
        var hr = myDate.toGMTString();
        //console.log(' human readable ' + hr)
        return hr;
    }

    const getQuestion = async (event) => {
        if (process.env.NODE_ENV === 'development') {
            console.log("****** getSelectedItem " + selectedItems[0].id);
        }
        try {
            setInputValueDisabled(false);
            setInputSubmitButtonDisabled(false);

        } catch (err) {
            console.log('get error ' + err);
        }
    }

    //console.log('items ' + JSON.stringify(items));


    const submitQuestion = (detail) => {
        setAnswer([]);
        if (inputValue === '') {
            return;
        }

        console.log('inputValue ' + inputValue);

        setInputSubmitButtonDisabled(true);
        setInputValueDisabled(true);
        setSpinnerVisible(false);
        const questionsObject = { context: inputValue };
        try {
            console.log('submitQuestion ' + inputValue);
            API.graphql(graphqlOperation(genQuestions, questionsObject)).then((response, error) => {

                if (error) {
                    console.log(error)
                } else {
                    console.log('genQuestions RESPONSE ' + JSON.stringify(response));
                    var response = JSON.stringify(response.data.genQuestions.response);
                    console.log('genQuestions ' + response);
                    response = response.replaceAll("\\", "");
                    response = response.replaceAll('"', "");

                    var a = response.substring(response.lastIndexOf('=') + 2, response.length - 2);
                    const splitResponse = a.split("nn");

                    
                    var splitFormattedText = [];
                    for (var i = 0; i < splitResponse.length; i++) {
                        splitFormattedText[i] = JSON.parse('{"question":'  + '\"'+splitResponse[i] +'\"}') ;
                        console.log(splitFormattedText[i]);
                        //if (i < splitResponse.length-1) {
                        //    splitFormattedText[i] += ",";
                        //}
                    }
                    console.log(' splitFormattedText ' + splitFormattedText);
/*
                    var test = [
                        {"question": "response:  Here are 5 potential questions from the lecture transcript:"},
                        {"question": "1. What is the main goal of this class according to Professor Grossman?"},
                        {"question": "2. What are some examples that Professor Grossman gives for how materials can be used in new ways to solve problems?" },
                        {"question": "3. What does Professor Grossman say is the key to understanding materials properties? "},
                        {"question": "4. According to the lecture, what was significant about the scientific method for the development of chemistry?"},
                        {"question": "5. How does Professor Grossman describe the unique age we live in today?"}
                      ]
*/

                    setFormattedText(splitFormattedText);
                    setInputValueDisabled(false);
                    setInputSubmitButtonDisabled(false);
                    setAnswer(formattedText);
                    setSpinnerVisible(true);
                }


            })
        } catch (err) {
            setAnswer(['Exception Thrown']);
            console.log(err)
            setInputValueDisabled(false);
            setInputSubmitButtonDisabled(false);
            setSpinnerVisible(true);
        }

    }
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

                window.location.reload(false);

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
                                Lecture Questions
                            </Header>
                            <Button
                                variant="primary"
                                disabled={deleteDisabled}
                                onClick={(event) => getQuestion(event)}
                            >
                                Generate Quiz Questions
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
                                    <React.Fragment>

                                    </React.Fragment>

                            },
                        ],
                    }}
                    cardsPerRow={[{ cards: 1 }, { minWidth: 400, cards: 2 }]}
                    items={selectedItemsOutputs}
                    loadingText="Loading resources"
                    empty={
                        <Box textAlign="center" color="inherit">
                            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                            <SpaceBetween direction="vertical" size="l">
                                            <Table
                                                columnDefinitions={[
                                                    {
                                                        id: "question",
                                                        header: "",
                                                        cell: e => e.question,
                                                        sortingField: "question",
                                                        isRowHeader: true
                                                    }
                                                    
                                                ]}
                                                items={formattedText}
                                                loadingText="Loading resources"
                                                empty={
                                                    <Box
                                                        margin={{ vertical: "xs" }}
                                                        textAlign="center"
                                                        color="inherit"
                                                    >
                                                        <SpaceBetween size="m">
                                                           
                                                        </SpaceBetween>
                                                    </Box>
                                                }
                                               
                                                header={<Header>Generated Questions</Header>}
                                                pagination={
                                                    <Pagination currentPageIndex={1} pagesCount={1} />
                                                }
                                            />


                                            
                                        </SpaceBetween>
                                <Form
                                    actions={
                                        <SpaceBetween direction="horizontal" size="l">
                                            <Button formAction="none" variant="link"> Cancel</Button>
                                            <Button disabled={inputSubmitButtonDisabled} onClick={(event) => submitQuestion(event)} variant="primary">Submit</Button>
                                        </SpaceBetween>}
                                >
                                    <FormField label="">
                                       
                                    </FormField>
                                </Form>

                            </Box>
                        </Box>
                    }
                    h />




            </div>

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
        header={<h2>Lecture Questions Help</h2>}
    >
        <div>

            <h3>From here you can :</h3>
            <ul>
                <li>
                    View the Questions gnerated from Lectures.
                </li>


            </ul>


        </div>
    </HelpPanel>
);

function GenQuestions() {
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

                    if (process.env.NODE_ENV === 'development')
                        console.log('API.graphql(graphqlOperation(listHackathonLectureSummaries, searchObject)) being called  .  .  . ');

                    const costObject = { id: "myId" };
                    API.graphql(graphqlOperation(listHackathonLectureSummaries, {})).then((response, error) => {

                        console.log('listHackathonLectureSummaries ' + JSON.stringify(response.data.listHackathonLectureSummaries.items));
                        // Declare a new array
                        let newArray = [];

                        // Declare an empty object
                        let uniqueObject = {};

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

                        //setCompletedItems(response.data.listHackathonLectureSummaries.items);
                        setCompletedItems(newArray);


                        //setCompletedItems(response.data.listHackathonLectureSummaries.items);

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

export default withAuthenticator(GenQuestions);
