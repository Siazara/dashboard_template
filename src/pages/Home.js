import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    Pie,
    PieChart,
    Area,
    AreaChart,
    Cell
} from "recharts";
import Axios from "axios";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import InfoTooltip from '@mui/material/Tooltip';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];


function Home() {
    const [appVisits, setAppVisits] = useState([Object]);
    const [portions, setPortions] = useState([Object]);
    const [hourlyDistribution, setHourlyDistribution] = useState([Object]);

    const featchData = async () => {

        const res0 = await Axios.get("http://localhost:5002/daily_activity");
        var { data } = await res0;
        setAppVisits(data.visits);
        setPortions(data.portions);
        setHourlyDistribution(data.hourly_distribution);
    }

    useEffect(() => {
        featchData();
    }, []);

    const labels = [
        {
            key: "frequenters",
            color: "green"
        },
        {
            key: "moderate",
            color: "yellow"
        },
        {
            key: "meh",
            color: "red"
        },
        {
            key: "apathetic",
            color: "cyan"
        },
    ];

    const [barProps, setBarProps] = useState(
        labels.reduce(
            (a, { key }) => {
                a[key] = false;
                return a;
            }
        )
    );

    const selectBar = (e) => {
        setBarProps({
            ...barProps,
            [e.dataKey]: !barProps[e.dataKey],
        });
    };


    return (
        <Box sx={{ bgcolor: '#EAF2F8'}}>
            <Grid container spacing={0.1} sx={{ mt: 2, width: '80vw' }}
                alignItems="center"
                justify="center">
                <Grid item xs={1} align="left" />
                <Grid item xs={10} align="left">
                    <Card variant="outlined" style={{ background: 'linear-gradient(to left, #2b2b4b, #2b2b4b)'}}>
                    <Typography color={'white'}>Clustering per visit frequency</Typography>
                        <React.Fragment>
                            <CardContent >
                                <AreaChart alignment="left" width={1100} height={350} data={appVisits}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="datetime" color="white" tick={{ fill: 'white', fontSize: 12 }} tickLine={{ stroke: 'red' }} />
                                    <YAxis color="white" width={50} tick={{ fill: 'white', fontSize: 15 }} tickLine={{ stroke: 'red' }} />
                                    <Tooltip />
                                    <Legend
                                        onClick={selectBar}
                                    />
                                    {labels.map((label, index) => (
                                        <Area type="monotone" dataKey={label.key} stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.5}
                                            hide={barProps[label.key] === true} />
                                    ))}
                                </AreaChart>
                            </CardContent>
                        </React.Fragment>
                        <InfoTooltip title={<h3 style={{ color: "white" }}>
                            tip 2.</h3>}>
                            <IconButton>
                                <InfoIcon style={{ color: 'white', fontSize: 35 }} />
                            </IconButton>
                        </InfoTooltip>
                    </Card>
                </Grid>
                <Grid item xs={1} align="left" />
                <Grid item xs={1} align="left" />
                <Grid item xs={4.75} >
                    <Card variant="outlined" style={{ backgroundColor: "#2b2b4b", height: '40vh' }}>
                        <Typography color={'white'}>Users per cluster</Typography>
                        <React.Fragment>
                            <CardContent >
                                <ResponsiveContainer width={500} height={300}>
                                    <PieChart  >
                                        <Tooltip />
                                        <Legend verticalAlign="top" height={70} />
                                        <Pie data={portions} dataKey="value" nameKey="name" label outerRadius={85} innerRadius={65} cy={100} >
                                            {
                                                portions.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                            }
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </React.Fragment>
                    </Card>
                </Grid>
                <Grid item xs={0.5} />
                <Grid item xs={4.75} >
                    <Card variant="outlined" style={{ backgroundColor: "#2b2b4b"}}>
                    <Typography color={'white'}>Distribution of events per hour</Typography>
                        <React.Fragment>
                            <CardContent >
                                <ResponsiveContainer width={500} height={300}>
                                    <BarChart width={730} height={250} data={hourlyDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#0088FE" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </React.Fragment>
                        <InfoTooltip title={<h3 style={{ color: "white" }}>
                            tip 3</h3>}>
                            <IconButton>
                                <InfoIcon style={{ color: 'white', fontSize: 35 }} />
                            </IconButton>
                        </InfoTooltip>
                    </Card>
                </Grid>
                <Grid item xs={1} />
            </Grid>
        </Box>
    )
}

export default Home;