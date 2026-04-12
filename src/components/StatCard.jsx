import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

/**
 * A reusable component for displaying a statistic with an icon.
 */
export default function StatCard({ title, value, icon, color }) {
    return (
        <Card variant="outlined" sx={{ height: "100%", bgcolor: "background.paper", borderRadius: "12px" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: "8px",
                            bgcolor: `${color}15`,
                            color: color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            {title}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {value}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
