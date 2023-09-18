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
    Form,
    Container,
    TextContent,
    FormField,
    FileUpload,
    ProgressBar,
    SpaceBetween,
    Alert


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

import awsconfig from "../../aws-exports";

Amplify.configure(awsconfig);

Storage.configure({
    AWSS3: {
        
        bucket: 'scotth-uploads-genaihackathon23',
        region: 'us-west-2',
        level: "public",
        customPrefix: {
            public: "",
        },
    },
});

const logger = new Logger("erdLogger", "DEBUG");
const Content = () => {


    const [value, setValue] = React.useState([]);
    const [progressBarValue, setProgressBarValue] = React.useState(0);
    const [progressStatus, setProgressStatus] = React.useState("success");
    const [submitDisabled, setSubmitDisabled] = React.useState(false);
    const [alertVisible, setAlertVisible] = React.useState(false);
    const [alertText, setAlertText] = React.useState('No files to updload');

    const submitForm = async (event) => {
        setAlertText("");
        if (value.length > 0) {
            setSubmitDisabled(true);
            setProgressStatus('in-progress');
            console.log('fileChanged ' + value[0].name);
            console.log('name ' + value.length);

            try {
                await Storage.put(value[0].name, value[0], {
                    bucket: 'scotth-uploads-genaihackathon23',
                    progressCallback(progress) {
                        //console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
                        setProgressBarValue((progress.loaded / progress.total) * 100);
                    },
                });
                console.log("uploading file success ");
                setValue([]);
                setProgressStatus('success');
                setSubmitDisabled(false);
            } catch (error) {
                console.log("Error uploading file: ", error);
                setProgressStatus('status');
                setSubmitDisabled(false);
                setAlertText(JSON.stringify(error));
                setAlertVisible(true);
            }

        } else {
            setAlertVisible(true);

        }


    }

    const fileChanged = (detail) => {
        setValue(detail.value);

    }
    const dismissAlert = (event) => {
        setAlertVisible(false);
    }

    return (
        <div id="top" >


            <Alert
                dismissible
                statusIconAriaLabel="Error"
                type="error"  
                onDismiss={() => dismissAlert()}
                visible={alertVisible} 
                 >
                {alertText}
            </Alert>
            <div className="container">

                <Form
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button formAction="none" variant="link"> Cancel
                            </Button>
                            <Button disabled={submitDisabled} onClick={(event) => submitForm(event)} variant="primary">Submit</Button>
                        </SpaceBetween>}
                >
                    <Container
                    >
                        <FormField label="Lecture Upload" description="Upload Audio or Video files of your Lectures."    >
                            <FileUpload
                                onChange={({ detail }) => fileChanged(detail)}
                                value={value}
                                fileErrors={[
                                    ""
                                ]}
                                i18nStrings={{
                                    uploadButtonText:
                                        e => e ? "Choose files" : "Choose file",
                                    dropzoneText: e =>
                                        e
                                            ? "Drop files to upload"
                                            : "Drop file to upload",
                                    removeFileAriaLabel: e => `Remove file ${e + 1}`,
                                    limitShowFewer: "Show fewer files",
                                    limitShowMore: "Show more files",
                                    errorIconAriaLabel: "Error"
                                }}

                                showFileLastModified
                                showFileSize
                                showFileThumbnail
                                tokenLimit={3}
                                constraintText="" />
                        </FormField>
                    </Container>
                </Form>
                <ProgressBar
                    value={progressBarValue}
                    additionalInfo=""
                    description=""
                    status={progressStatus}
                    label="Upload Progress"
                />

            </div>
        </div>

    );

};

const SideHelp = () => (
    <HelpPanel
        footer={
            <div>

            </div>
        }
        header={<h2>Upload Lecture Help</h2>}
    >
        <div>

            <h3>From here you can :</h3>
            <ul>
                <li>
                    Upload Lecture Files
                </li>

            </ul>


        </div>
    </HelpPanel>
);

function Upload() {
    const [User, setUser] = useState({});
    const [completedItems, setCompletedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    if (process.env.NODE_ENV === 'development')
        console.log('The Upload setup begins ---------->');
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

                    setUser(current_user);
                    setIsLoading(false);


                })
                .catch(
                    (err) => {
                        setIsLoading(false);
                        if (process.env.NODE_ENV === 'development')
                            console.log("Upload -> index.jsx - Auth error " + JSON.stringify(err), Date.now())

                    });
        } catch (e) {
            setIsLoading(false);
            if (process.env.NODE_ENV === 'development')
                console.log(JSON.stringify(e));

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
                content={<Content User={User} />}
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

export default withAuthenticator(Upload);
