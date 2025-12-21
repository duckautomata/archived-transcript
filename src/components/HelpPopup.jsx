import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

/**
 * Helper component to display guide images with a Paper background.
 */
export default function HelpPopup({ open, setOpen }) {
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
                                    There are currently 2 settings. All settings are stored in local storage and persist
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
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
