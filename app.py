from flask import Flask, render_template, request, jsonify
import mysql.connector as connection
import pandas as pd
from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Session
import random




app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/3T.html')
def TTT():
    return render_template('3T.html')

@app.route('/blackjack.html')
def blackjack():
    return render_template('blackjack.html')


#This will be a purely random bJQ for data generation
@app.route('/bJQTST', methods=['POST'])
def bJQTST():
    print('Entered the request processing method dCIQ')
    #Get JSON data from the request
    data = request.get_json()
    #Use data
    print(jsonify(data))

    #No state currently exists, so we have to choose at random
    choiceIndex = random.randint(0, len(data['choices'])-1)
    choice = data['choices'][choiceIndex]

    return jsonify(choice)

#So here is our blackJackQuery
@app.route('/bJQ', methods=['POST'])
def bJQ():
    print('Entered the request processing method dCIQ')
    #Get JSON data from the request
    data = request.get_json()
    #Use data
    print(jsonify(data))

    #Connection String 
    engine = sa.create_engine(redactedConnectionString)
    
    with Session(engine) as session:
        actionFactors = session.query('State').filter_by(deckFactor=data['deckFactor'], stateFactor=data['stateFactor']).one_or_none()
        if actionFactors is not None:
            #We need to check each object and assign our factors
            #HitFactor
            for i in range(len(data['choices'])):
                try:
                    if data['choices'][i] == 'Hit':
                        hitFactor = actionFactors.hitFactor
                        choice = 'Hit'
                except IndexError:
                    print("Index doesn't exist")
            #StayFactor
            for i in range(len(data['choices'])):
                try:
                    if data['choices'][i] == 'Stay':
                        stayFactor = actionFactors.stayFactor
                        if stayFactor > hitFactor:
                            choice = 'Stay'
                except IndexError:
                    print("Index doesn't exist")
            #DoubleFactor
            for i in range(len(data['choices'])):
                try:
                    if data['choices'][i] == 'Double':
                        doubleFactor = actionFactors.doubleFactor
                        if doubleFactor > stayFactor and doubleFactor > hitFactor:
                            choice = 'Double'
                except IndexError:
                    print("Index doesn't exist")
            #HitFactor
            for i in range(len(data['choices'])):
                try:
                    if data['choices'][i] == 'Split':
                        splitFactor = actionFactors.splitFactor
                        if splitFactor > stayFactor and splitFactor > hitFactor and splitFactor > doubleFactor:
                            choice = 'Split'
                except IndexError:
                    print("Index doesn't exist")
        else:
            #No state currently exists, so we have to choose at random
            choiceIndex = random.randint(0, len(data['choices'])-1)
            choice = data['choices'][choiceIndex]


    #Response
    return jsonify(choice)



#The following route accepts a request containing our game statistics, and proceeds to write the results to the database
@app.route('/dCIQ', methods=['POST'])
def dCIQ():
    print('Entered the request processing method dCIQ')
    #Get JSON data from the request
    data = request.get_json()
    #Use data
    print(jsonify(data))
    
    #First we write our Game Insert Query
    #Connection string
    cnxn = connection.connect(redactedConnectionString)
    print("Connection established")
    formatted_timestamp = datetime.strptime(data["timeStamp"], "%m/%d/%Y, %I:%M:%S %p").strftime("%Y-%m-%d %H:%M:%S")
    print(formatted_timestamp)
    gIQ = "INSERT INTO Game (human, actionCount, time, ante, winState, dealerCard) VALUES ('" + data["human"] + "', '" + str(data["actionCount"]) + "', '" + str(formatted_timestamp) + "', '" + str(data["ante"]) + "', '" + str(data["winState"]) + "', '" + str(data["dealerCard"]) + "');"
    print ("gIQ Defined")
    cursor = cnxn.cursor()
    print ('cursor created')
    cursor.execute(gIQ)
    print (gIQ)

    cnxn.commit()
    print ('gIQ committed')
    #That should have written our Game Data
    #Let's query for the Game_ID
    queryGameId = "SELECT ID FROM Game WHERE Game.time = '" + str(formatted_timestamp) + "';"
    gameIdDataFrame = pd.read_sql(queryGameId, cnxn)
    print(gameIdDataFrame.at[0, 'ID'])
    print("We now have gameId in the dataframe")
    #Now to loop for the state data
    loopy = 0
    for x in data['stateData']:
        print('stateData Loop Begin')
        #First we should check if this particular state exists yet.  Run query
        if x["terminalStatus"] == True:
            tS = 1
        else:
            tS = 0
        checkStateTable = "SELECT ID FROM State WHERE State.stateFactor = '" + str(x["scoreData"]) + "' AND State.deckFactor = '" + str(x["deckFactor"]) + "' AND State.terminalStatus = '" + str(tS) + "';"
        print(checkStateTable)
        stateIdDataFrame = pd.read_sql(checkStateTable, cnxn)
        
        if stateIdDataFrame.empty:
            sIQ = "INSERT INTO State (stateFactor, deckFactor, terminalStatus) VALUES ('" + str(x["scoreData"]) + "', '" + str(x["deckFactor"]) + "', '" + str(tS) + "');"
            print(sIQ)
            cursor.execute(sIQ)
            cnxn.commit()
            print('sIQ committed')
            checkStateTable = "SELECT ID FROM State WHERE State.stateFactor = '" + str(x["scoreData"]) + "' AND State.deckFactor = '" + str(x["deckFactor"]) + "' AND State.terminalStatus = '" + str(tS) + "';"
            stateIdDataFrame = pd.read_sql(checkStateTable, cnxn)
        #Now we have our stateID.  If terminal state is false, our action lines up with it
        if x["terminalStatus"] == False:
            #Time for an action query
            try:
                aD = data['actionData'][loopy]
            except:
                aD=data['actionData'][loopy-1]
            print(aD)
            aIQ = "INSERT INTO Action (Game_ID, State_ID, Action, stateChange) VALUES (" + str(gameIdDataFrame.at[0, 'ID']) + ", " + str(stateIdDataFrame.at[0, 'ID']) + ", '" + str(aD['action']) + "', " + str(aD['stateChange']) + ");"
            print(aIQ)
            cursor.execute(aIQ)
            cnxn.commit()
        loopy = loopy + 1
    else:
        print('stateData else begin')
        #So now we should have our State table updated AND our sIDF
        #should record the State_ID of the terminal state.  Let's
        #write this to our game table.
        tSIDQ = "UPDATE Game SET terminalState_ID = " + str(stateIdDataFrame.at[0, 'ID']) + " WHERE ID = " + str(gameIdDataFrame.at[0, 'ID']) + ";"
        print(tSIDQ)
        cursor.execute(tSIDQ)
        cnxn.commit()
        print("tSIDQ committed")

    #One last thing.  Update queries!
    actionFactorQuery = "SELECT AVG(Action.stateChange) as actionFactor FROM Action WHERE Action.State_ID=(ID) AND Action.Action = '(action)';"
    actionFactorUpdateQuery = "UPDATE State SET (act)Factor = (hF) WHERE State.ID = (sId);"
    selectIdQuery = "SELECT ID FROM State;"

    #Get all State.ID's
    stateId = pd.read_sql(selectIdQuery, cnxn)
    # loop through the rows using iterrows()
    for index, row in stateId.iterrows():
        #For each ID
        #First Hit
        hFQ1 = actionFactorQuery.replace('(action)', 'Hit')
        hFQ2 = hFQ1.replace('(ID)', str(row["ID"]))
        print(hFQ2)
        hitFactorQuery = pd.read_sql(hFQ2, cnxn)
        if len(hitFactorQuery.index) > 0:
            hFUQ1 = actionFactorUpdateQuery.replace('(act)', 'hit')
            hFUQ2 = hFUQ1.replace('(hF)', str(hitFactorQuery.at[0, 'actionFactor']))
            hFUQ3 = hFUQ2.replace('(sId)', str(row["ID"]))
            print(hFUQ3)
            if "None" not in hFUQ3:
                cursor.execute(hFUQ3)
                cnxn.commit()
                print('hFUQ3 committed')
        #Then Stay
        sFQ1 = actionFactorQuery.replace('(action)', 'Stay')
        sFQ2 = sFQ1.replace('(ID)', str(row["ID"]))
        print(sFQ2)
        stayFactorQuery = pd.read_sql(sFQ2, cnxn)
        if len(stayFactorQuery.index) > 0:
            sFUQ1 = actionFactorUpdateQuery.replace('(act)', 'stay')
            sFUQ2 = sFUQ1.replace('(hF)', str(stayFactorQuery.at[0, 'actionFactor']))
            sFUQ3 = sFUQ2.replace('(sId)', str(row["ID"]))
            print(sFUQ3)
            if "None" not in sFUQ3:
                cursor.execute(sFUQ3)
                cnxn.commit()
                print('sFUQ3 committed')
        #Then double
        dFQ1 = actionFactorQuery.replace('(action)', 'Double')
        dFQ2 = dFQ1.replace('(ID)', str(row["ID"]))
        print(dFQ2)
        doubleFactorQuery = pd.read_sql(dFQ2, cnxn)
        if len(doubleFactorQuery.index) > 0:
            dFUQ1 = actionFactorUpdateQuery.replace('(act)', 'double')
            dFUQ2 = dFUQ1.replace('(hF)', str(doubleFactorQuery.at[0, 'actionFactor']))
            dFUQ3 = dFUQ2.replace('(sId)', str(row["ID"]))
            print(dFUQ3)
            if "None" not in dFUQ3:
                cursor.execute(dFUQ3)
                cnxn.commit()
                print('dFUQ3 committed')
        #Then split
        spFQ1 = actionFactorQuery.replace('(action)', 'Split')
        spFQ2 = spFQ1.replace('(ID)', str(row["ID"]))
        print(spFQ2)
        splitFactorQuery = pd.read_sql(spFQ2, cnxn)
        if len(splitFactorQuery.index) > 0:
            spFUQ1 = actionFactorUpdateQuery.replace('(act)', 'split')
            spFUQ2 = spFUQ1.replace('(hF)', str(splitFactorQuery.at[0, 'actionFactor']))
            spFUQ3 = spFUQ2.replace('(sId)', str(row["ID"]))
            print(spFUQ3)
            if "None" not in spFUQ3:
                cursor.execute(spFUQ3)
                cnxn.commit()
                print('spFUQ3 committed')


   #Our queries should be completed!  Now let's close the connection
    cnxn.close()

    #return success message
    return jsonify('dCIQ uploaded and update queries processed successfully!')
