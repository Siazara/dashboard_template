import json
from flask import Flask, request
from flask_cors import CORS
from datetime import datetime, timedelta
import psycopg2
import ast
from operator import itemgetter
import pandas as pd


app = Flask(__name__)
CORS(app)

# conn = psycopg2.connect(database="database", user = "postgres", password = "password", host = "127.0.0.1", port = "5432")

def datetime_converter(date):
    """
    	Converts the date.

        Args:
            date: date that we want to convert.

        Returns:
            result: converted date.
    """
    month2num = {
        'Jan':'01',
        'Feb':'02',
        'Mar':'03',
        'Apr':'04',
        'May':'05',
        'Jun':'06',
        'Jul':'07',
        'Aug':'08',
        'Sep':'09',
        'Oct':'10',
        'Nov':'11',
        'Dec':'12'
    }
    date = str(date)
    date = date.split()
    result = '-'.join([date[3], month2num[date[1]], date[2]])
    return result

@app.route('/hourly_one_event_activity', methods=["POST", "GET"])
def hourly_one_event_activity():
    event_name = request.args.get('event_name', type=str)

    data = list(
        map(lambda x: {'name': x[0], 'value': x[1]}, 
        list(
            zip(
                list(
                    map(str,
                        list(range(24))
                    )), 
                list(range(24))
                )
            )
        ))
    
    return json.dumps(data)

@app.route('/get_event_names', methods=["POST", "GET"])
def get_event_names():

    df = ['valasr_setting_event',
        'valasr_quick_access_click',
        'valasr_calendar_event',
        'valasr_bottom_nav_item_click',
        'valasr_dialog_event',
        'valasr_open_reader',
        'valasr_daily_amal_shortcut',
        'valasr_search_event',
        'session_start']
    
    return json.dumps(df)

@app.route('/daily_activity', methods=["POST", "GET"])
def daily_activity():

    data = list(zip(list(range(24)), list(range(24)), list(range(24)), list(range(24)), list(range(24))))

    data = list(map(lambda x: {
                'datetime': x[0], 'frequenters': x[1]
                , 'moderate': x[2], 'meh': x[3], 'apathetic': x[4]}, data))

    data = {'visits': data, 'portions': [
        {'name': 'frequenters',
        'value': 100},
        {'name': 'moderate',
        'value': 150}, 
        {'name': 'meh',
        'value': 200}, 
        {'name': 'apathetic',
        'value': 50}
        ],
        'hourly_distribution': list(map(lambda x: {'hour': x[0], 'value': x[1]}, list(zip(
            list(range(24)), 
            list(range(24))))))
        }

    return json.dumps(data)

@app.route('/retention', methods=["POST", "GET"])
def summary_data():
    start_date = datetime.fromisoformat(
        datetime_converter(
        request.args.get('startdate', type=str))).timestamp() * 1000000

    end_date = datetime.fromisoformat(
        datetime_converter(
        request.args.get('enddate', type=str))).timestamp() * 1000000

    cur = conn.cursor()
    cur.execute(f"SELECT event_timestamp, user_pseudo_id FROM table WHERE event_timestamp >= {start_date} AND event_timestamp <= {end_date};")
    df = cur.fetchall()
    df = pd.DataFrame(df, columns=['event_timestamp', 'user_pseudo_id'])

    df['event_datetime'] = pd.to_datetime(df['event_timestamp'] / 1e3, unit='ms').dt.tz_localize(None)
    df['event_date'] = df['event_datetime'].dt.date
    df['weekday'] = (df.event_datetime.dt.weekday + 2) % 7

    df['TransactionWeek'] = df['event_date'].apply(get_week)
    grouping = df.groupby('user_pseudo_id')['TransactionWeek']
    df['CohortWeek'] = grouping.transform('min')
    df['CohortIndex'] = df['TransactionWeek'] - df['CohortWeek']

    grouping = df.groupby(['CohortWeek', 'CohortIndex'])

    # Counting number of unique customer Id's falling in each group of CohortWeek and CohortIndex
    cohort_data = grouping['user_pseudo_id'].apply(pd.Series.nunique)
    cohort_data = cohort_data.reset_index()

    # Assigning column names to the dataframe created above
    cohort_counts = cohort_data.pivot(index='CohortWeek',
                                    columns ='CohortIndex',
                                    values = 'user_pseudo_id')

    cohort_sizes = cohort_counts.iloc[:,0]

    retention_df = cohort_counts.divide(cohort_sizes, axis=0).reset_index()

    data = []
    for _, row in cohort_data.iterrows():
        data.append({
            "cohort_date": int(row.CohortWeek),
            "period_date": int(row.CohortWeek + row.CohortIndex),
            "users": int(row.user_pseudo_id), 
            "period_number": int(row.CohortIndex), 
            "percentage": float(retention_df[retention_df['CohortWeek'] == row.CohortWeek][row.CohortIndex].values[0])
            })

    return json.dumps(data)

@app.route('/open_reader_item', methods=["POST", "GET"])
def open_reader_item():
    
    data = {
        'bookPartCount': list(
            map(lambda x: {'name': x[0], 'value': x[1], 'book': x[2], 'color_index': x[3]},
             list(zip(
                [545, 343, 232],
                [333, 444, 555],
                [2, 7, 2],
                [1, 0, 0]
                )))),
        'bookCount': list(
            map(lambda x: {'name': x[0], 'value': x[1]},
            list(zip(list(range(24)),
            list(range(24)))))),
        'hourlyBook1': list(
            map(lambda x: {'hour': x[0], 'value': x[1]}, 
            list(zip(list(range(24)),
             list(range(24))))
            )),
        'hourlyBook4': list(
            map(lambda x: {'hour': x[0], 'value': x[1]}, 
            list(zip(list(range(24)),
             list(range(24))))
            )),
        'hourlyBook5': list(
            map(lambda x: {'hour': x[0], 'value': x[1]}, 
            list(zip(list(range(24)),
             list(range(24))))
            )),
        'hourlyBook7': list(
            map(lambda x: {'hour': x[0], 'value': x[1]}, 
            list(zip(list(range(24)),
             list(range(24))))
            ))
        }
    
    return json.dumps(data)

@app.route('/reading_habit', methods=["POST", "GET"])
def reading_habit():

    data = {
        'reading_habit_sample1': list(
            map(lambda x: {'name': x[0], 'value': x[1]},
             list(zip(list(range(24)), list(range(24))))
             )),
        'reading_habit_sample2': list(
            map(lambda x: {'name': x[0], 'value': x[1]},
             list(zip(list(range(24)), list(range(24))))
             )),
        'reading_habit_sample3': list(
            map(lambda x: {'name': x[0], 'value': x[1]},
             list(zip(list(range(24)), list(range(24))))
             )),
        'reading_habit_sample4': list(
            map(lambda x: {'name': x[0], 'value': x[1]},
             list(zip(list(range(24)), list(range(24))))
             ))
        }
    
    return json.dumps(data)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
