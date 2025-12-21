import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useAppStore } from "../store/store";

// Light images
import membership_setting_empty_light from "../assets/membership-setting-empty-light.png";
import membership_setting_set_light from "../assets/membership-setting-set-light.png";
import membership_example_stream_light from "../assets/membership-example-stream-light.png";
import search_empty_light from "../assets/search-empty-light.png";
import search_notext_light from "../assets/search-notext-light.png";
import search_text_light from "../assets/search-text-light.png";

// Dark images
import membership_setting_empty_dark from "../assets/membership-setting-empty-dark.png";
import membership_setting_set_dark from "../assets/membership-setting-set-dark.png";
import membership_example_stream_dark from "../assets/membership-example-stream-dark.png";
import search_empty_dark from "../assets/search-empty-dark.png";
import search_notext_dark from "../assets/search-notext-dark.png";
import search_text_dark from "../assets/search-text-dark.png";

/**
 * Helper component to display guide images with a Paper background.
 */
const HelpImage = ({ src, width = "100%", alt = "" }) => (
    <Paper
        elevation={3}
        sx={{
            my: 2,
            p: 0.5,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            width: "fit-content",
            maxWidth: "100%",
            mx: "auto",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        <img
            src={src}
            alt={alt}
            style={{
                width: width,
                maxWidth: "100%",
                height: "auto",
                display: "block",
                margin: "0 auto",
            }}
        />
    </Paper>
);

/**
 * A dialog displaying help information and guides for the application.
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function(boolean): void} props.setOpen - Callback to change the open state.
 */
export default function HelpPopup({ open, setOpen }) {
    const theme = useAppStore((state) => state.theme);
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const isDarkMode = theme === "dark" || (theme === "system" && prefersDarkMode);

    const images = {
        membershipSettingEmpty: isDarkMode ? membership_setting_empty_dark : membership_setting_empty_light,
        membershipSettingSet: isDarkMode ? membership_setting_set_dark : membership_setting_set_light,
        membershipExampleStream: isDarkMode ? membership_example_stream_dark : membership_example_stream_light,
        searchEmpty: isDarkMode ? search_empty_dark : search_empty_light,
        searchNoText: isDarkMode ? search_notext_dark : search_notext_light,
        searchText: isDarkMode ? search_text_dark : search_text_light,
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">How to Use Archived Transcript</DialogTitle>
                <DialogContent>
                    <div>
                        {/* Settings */}
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" gutterBottom>
                                    Settings are at the left of the page. Click the cogwheel icon to view the settings
                                    menu.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    There are currently 3 settings. All settings are stored in local storage and persist
                                    across sessions.
                                </Typography>
                                <ul>
                                    <li>
                                        Theme: Select the color theme of the site. Light, Dark, or System default.
                                        <blockquote>
                                            System default will use whatever you set in your operating system. This is
                                            set by default.
                                        </blockquote>
                                    </li>
                                    <li>
                                        Density: How much space should be between lines.
                                        <blockquote>Select whichever makes it easier to read.</blockquote>
                                    </li>
                                </ul>
                                The third setting is explained in the &quot;Membership&quot; section.
                            </AccordionDetails>
                        </Accordion>

                        {/* Sidebar */}
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Sidebar</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" gutterBottom>
                                    Allows you to easily jump between pages. Located on the left of your screen.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Sidebar is broken up into 2 parts.
                                </Typography>
                                <ul>
                                    <li>
                                        Pages
                                        <blockquote>
                                            Select how you want to query the transcripts. Either search them, or graph
                                            them.
                                        </blockquote>
                                    </li>
                                    <li>
                                        Other
                                        <blockquote>
                                            General options. View github url, open the help menu (this), or change the
                                            site settings.
                                        </blockquote>
                                    </li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>

                        {/* Search */}
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Search</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" gutterBottom>
                                    You can search for when something was said and in what stream it was said in. You
                                    can also use filters to refine your search.
                                </Typography>
                                <HelpImage src={images.searchEmpty} alt="Empty Search" />
                                <Typography variant="body1" gutterBottom>
                                    Match Whole Word means it will not include any substrings of your search text. For
                                    example: say you search for &#34;ball&#34;. If Match Whole Word is enabled, then it
                                    will only return results for &#34;ball&#34; and not &#34;balls&#34; or
                                    &#34;baller&#34;.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    If search text is empty, then it will try to find all streams that match the filter,
                                    but return no text.
                                </Typography>
                                <HelpImage src={images.searchNoText} alt="No Text Search" />
                                <br />
                                <Typography variant="body1" gutterBottom>
                                    Once the search has been completed, you will see a list of streams that fit the
                                    criteria. You can click on a stream to:
                                    <ul>
                                        <li>view contexts of your search text</li>
                                        <li>Click a button to view the entire transcript for that stream</li>
                                        <li>Click a button to graph that stream only</li>
                                    </ul>
                                </Typography>
                                <HelpImage src={images.searchText} alt="Text Search" />
                                <Typography variant="body1" gutterBottom>
                                    You can also click on the link button on a context line to:
                                    <ul>
                                        <li>Jump to the transcript at that timestamp</li>
                                        <li>Copy the link to the stream at that timestamp</li>
                                        <li>Open the stream at that timestamp in a new tab</li>
                                    </ul>
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        {/* Graph */}
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Graph</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" gutterBottom>
                                    You can graph word or phase usage over time. There are two types of graph:
                                    <ul>
                                        <li>Across multiple streams</li>
                                        <li>Across a single stream</li>
                                    </ul>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    The multi-stream graph can be accessed by clicking the graph button in the sidebar.
                                    The single-stream graph can only be accessed by clicking the &#34;Graph This
                                    Stream&#34; button on the search page.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Graphing functions the same as searching, with the only difference being you view a
                                    graph instead of a list of streams.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Once graphed, you can switch between a cumulative sum or a rate over time (default).
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        {/* Transcript */}
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Transcript</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" gutterBottom>
                                    You can view the entire transcript for a stream by clicking the &#34;View Full
                                    Transcript&#34; button on the search page.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    The transcript view is the exact same as on Live-Transcript. You can click the link
                                    button on the left of a line to either open the stream at that timestamp or copy the
                                    link to it.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        {/* Membership */}
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Membership</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" gutterBottom>
                                    In order to search through members transcripts, you must have a valid key. Each
                                    streamer has their own key, and you can only use one key at a time. This means that
                                    you cannot search through members streams of multiple streamers at the same time.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    To verify your key, go to settings
                                </Typography>
                                <HelpImage src={images.membershipSettingEmpty} alt="Empty Membership Setting" />
                                <Typography variant="body1" gutterBottom>
                                    Enter the key, and click verify. If valid, it will be saved and you will see what
                                    streamer it is valid for, and when it expires.
                                </Typography>
                                <HelpImage
                                    src={images.membershipSettingSet}
                                    alt="Membership Setting Set Successfully"
                                />
                                <Typography variant="body1" gutterBottom>
                                    You can set a new key by deleting the key and verifying a new one.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Once the key is verified, you will be able to search through and graph members
                                    streams.
                                </Typography>
                                <HelpImage src={images.membershipExampleStream} alt="Example Membership Stream" />
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
