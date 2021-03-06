# parseData.py | python3 Nate Beatty | February, 2013 For the IntlPop project
#
# Parses CSV data from the given input directory
# and outputs a series of javascript files appropriate
# for use in the IntlPop! 3.0 web application.
#
# Run to download data from the UN and generate JSON data files
# which are automatically placed in the web application directory.
# The following will generate 2010 files from csv's in the tmp dir:
#
# $ python parseData.py 2010 
#
# If you need to download the data from the UN, run with the -d option:
#
# $ python parseData.py -d 2010
#
# Note that downloading all of the data from the UN will take a while
# and download speeds depend on your internet connection.
#
# Also note that the data download requires the `requests` and `xlrd`
# python packages. You can install these using pip or your preferred
# python package manager.

# import packages available in the Python Standard Library
import sys
import os
import shutil
import codecs
import csv
import json
import math

###########################
#  User Editable Options  #
###########################

TMP_DIR = 'tmp' # The directory containing the CSV files
CSV_DIR = '../CSV_Files' # Where the converted CSV files will be stored
RAW_DIR = '../RawData_Files' # Where the raw xml files will be stored
OUT_DIR = '../CountryData' # Where the JSON output files will be created

UNDataFiles = [
  ['POPULATION_BY_AGE_MALE', 'http://esa.un.org/unpd/wpp/Excel-Data/EXCEL_FILES/1_Population/WPP2012_POP_F07_2_POPULATION_BY_AGE_MALE.XLS'],
  ['POPULATION_BY_AGE_FEMALE','http://esa.un.org/unpd/wpp/Excel-Data/EXCEL_FILES/1_Population/WPP2012_POP_F07_3_POPULATION_BY_AGE_FEMALE.XLS'],
  ['DEATHS_BY_AGE_MALE', 'http://esa.un.org/unpd/wpp/Excel-Data/EXCEL_FILES/3_Mortality/WPP2012_MORT_F04_2_DEATHS_BY_AGE_MALE.XLS'],
  ['DEATHS_BY_AGE_FEMALE', 'http://esa.un.org/unpd/wpp/Excel-Data/EXCEL_FILES/3_Mortality/WPP2012_MORT_F04_3_DEATHS_BY_AGE_FEMALE.XLS'],
  ['BIRTHS_BY_AGE_OF_MOTHER', 'http://esa.un.org/unpd/wpp/Excel-Data/EXCEL_FILES/2_Fertility/WPP2012_FERT_F06_BIRTHS_BY_AGE_OF_MOTHER.XLS'],
  ['IMR_BOTH_SEXES', 'http://esa.un.org/unpd/wpp/Excel-Data/EXCEL_FILES/3_Mortality/WPP2012_MORT_F01_1_IMR_BOTH_SEXES.XLS'],
  ['NET_NUMBER_OF_MIGRANTS', 'http://esa.un.org/unpd/wpp/Excel-Data/EXCEL_FILES/4_Migration/WPP2012_MIGR_F01_NET_MIGRATION_RATE.XLS'],
]

validYears = [2000, 2005, 2010]
validOptions = ['-d', '--download', '-c', '--countrylist']

# You shouldn't need to edit below this line:
#======================================================#

#############################
#  Usage and Preliminaries  #
#############################

# The following define the CSV filenames
f_POPULATION_BY_AGE_MALE = UNDataFiles[0][0] + '.CSV'
f_POPULATION_BY_AGE_FEMALE = UNDataFiles[1][0] + '.CSV'
f_DEATHS_BY_AGE_MALE = UNDataFiles[2][0] + '.CSV'
f_DEATHS_BY_AGE_FEMALE = UNDataFiles[3][0] + '.CSV'
f_BIRTHS_BY_AGE_OF_MOTHER = UNDataFiles[4][0] + '.CSV'
f_IMR_BOTH_SEXES = UNDataFiles[5][0] + '.CSV'
f_NET_NUMBER_OF_MIGRANTS = UNDataFiles[6][0] + '.CSV'

# Checks that command line arguments are valid
# 
# @return true if valid, false otherwise.
def validArgs():
  # print('Checking args: ' + str(sys.argv)) # For debugging
  if len(sys.argv) not in range(2, 5):
    print('Arguments invalid.')
    return False
  if int(sys.argv[-1]) not in validYears:
    print('Year specified invalid.')
    return False
  if len(sys.argv) >= 3 and sys.argv[1] not in validOptions:
    print('Invalid flag: ' + sys.argv[1])
    return False
  if len(sys.argv) >= 4 and sys.argv[2] not in validOptions:
    print('Invalid flag: ' + sys.argv[2])
    return False
  return True

# Prints a usage message
def printUsage():
  print('\nUsage: python parseData.py [-d|--download] [-c|--countrylist] <date>\n\n\
    Date can be 2000, 2005, or 2010.\n\n\
    Optional Flags:\n\
      -d | --download     : Downloads raw data directly from the UN.\n\
                            This option should be used if you have not previously\n\
                            downloaded any raw data.\n\
      -c | --countrylist  : Generates countrylist.json, an array of country objects\n\
                            containing names, aliases, country codes, and relevant\n\
                            country-specific file names generated by this script.\n\
    ')

################################
#  Data File Download Methods  #
################################

# Searches for the directory specified by the global variable `TMP_DIR`.
# If found, this function empties the contents of the directory. 
# Otherwise, it creates a new directory as specified by `TMP_DIR`.
def removeTmpFiles():
  if os.path.exists(TMP_DIR):
    print('Removing old temp files.')
    for the_file in os.listdir(TMP_DIR):
      file_path = os.path.join(TMP_DIR, the_file)
      try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
      except:
        print('There was a problem removing the old temp data files.')
        exit(1)
  else:
    try:
      print('Creating temp directory at ' + TMP_DIR)
      os.makedirs(TMP_DIR)
    except:
      print('Could not generate temp file directory.')
      exit(1)


def downloadXLSData():
  for item in UNDataFiles:
    file_url = item[1]
    file_path = os.path.join(TMP_DIR, item[0] + '.xls')

    http = urllib3.PoolManager()
    with open(file_path, 'wb') as f:
      print('Downloading %s' % item[0])
      response = http.request('GET', file_url, preload_content=False)
      headers = response.getheaders()
      filesize = int(headers['content-length'])
      if filesize is None or headers['content-type'] != 'application/vnd.ms-excel':
        print('There was a problem downloading this file.')
      print('Expected Filesize: %s' % sizeString(int(filesize)))
      blocksize = int(math.ceil(filesize/100.))
      for progress in range(100):
        sys.stdout.write("\r Progress: [%s] %.1f%%" % (('#' * math.ceil(progress / 5) + ' ' * math.floor(20 - progress/5) ), progress + 1))
        sys.stdout.flush()
        f.write(response.read(blocksize))
    print('')
    f.close()
  # make sure the files are valid
  for item in UNDataFiles:
    file_path = os.path.join(TMP_DIR, item[0] + '.xls')
    # print(os.stat(file_path))
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
      print('Some data files were not downloaded.')
      exit(1)
    try:
      file_size = os.path.getsize(file_path)
    except:
      print('There was a problem downloading the data files.')
      exit(1)
    if file_size <= 0:
      print('There was a problem downloading the data files.')
      exit(1)
  # move the completed files to the raw file directory
  # replacing any files that are already there.
  if os.path.exists(RAW_DIR):
    print('Removing old raw data files.')
    for the_file in os.listdir(RAW_DIR):
      file_path = os.path.join(RAW_DIR, the_file)
      try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
      except:
        print('There was a problem removing the old raw data files.')
        exit(1)
  else:
    try:
      print('Creating raw data directory at ' + RAW_DIR)
      os.makedirs(RAW_DIR)
    except:
      print('Could not create the raw data directory.')
      exit(1)
  for item in UNDataFiles:
    file_path_tmp = os.path.join(TMP_DIR, item[0] + '.xls')
    file_path_new = os.path.join(RAW_DIR, item[0] + '.xls')
    shutil.move(file_path_tmp, file_path_new)


def makeCSVFiles():
  for item in UNDataFiles:
    print('Generating CSV file for ' + item[0])
    xls_path = os.path.join(RAW_DIR, item[0] + '.xls')
    tmp_path = os.path.join(TMP_DIR, item[0] + '.csv')
    with xlrd.open_workbook(xls_path) as wb:
      sh = wb.sheet_by_index(0)
      with open(tmp_path, 'w', newline='') as f:
        c = csv.writer(f)
        for r in range(sh.nrows):
          c.writerow(sh.row_values(r))
  # Move the CSV files to the CSV_DIR, replacing any old files there
  if os.path.exists(CSV_DIR):
    print('Removing old raw data files.')
    for the_file in os.listdir(CSV_DIR):
      file_path = os.path.join(CSV_DIR, the_file)
      try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
      except:
        print('There was a problem removing the old CSV data files.')
        exit(1)
  else:
    try:
      print('Creating CSV directory at ' + CSV_DIR)
      os.makedirs(CSV_DIR)
    except:
      print('Could not generate CSV data output directory.')
      exit(1)
  for item in UNDataFiles:
    file_path_tmp = os.path.join(TMP_DIR, item[0] + '.csv')
    file_path_new = os.path.join(CSV_DIR, item[0] + '.csv')
    shutil.move(file_path_tmp, file_path_new)


##################################
#  Data File Generation Methods  #
##################################

# Generates files for the given year
# 
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def generateFiles(year):
  # Create output directory
  if os.path.exists(OUT_DIR):
    print('Removing old data files.')
    for the_file in os.listdir(OUT_DIR):
      file_path = os.path.join(OUT_DIR, the_file)
      try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
      except:
        print('There was a problem removing the old data files.')
        exit(1)
  else:
    try:
      print('Creating output directory at ' + OUT_DIR)
      os.makedirs(OUT_DIR)
    except:
      print('Could not generate output file directory.')
      exit(1)
  
  print('Generating files for year %s data.' % (str(year)))
  # Make a file for each country based on the male population data
  dataFile = codecs.open(os.path.join(CSV_DIR, f_POPULATION_BY_AGE_MALE), 'r', encoding='latin1')
  data = csv.reader(dataFile)

  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(float(row[5])) == year: # Only record the requested year
      countryName = row[2]
      countryCode = int(float(row[4]))

      filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), countryCode))

      f = open(filePath, 'w') # Make the new file

      # Write some preliminary stuff
      f.write('{\n')
      f.write('  "name": "%s",\n' % (countryName))
      f.write('  "countryId": %s,\n' % (str(countryCode)))
      f.write('  "startYear": %s,\n' % (str(year)))

      f.close()
  dataFile.close()

# Appends male and female population data for the given year
# to all of the .js files in the output directory. This method
# should be called immediately after `generateFiles`.
#
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def appendPopData(year):
  # Start with male population
  print('Parsing male population data.')
  dataFile = codecs.open(os.path.join(CSV_DIR, f_POPULATION_BY_AGE_MALE), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if intify(row[5]) == year: # Only record the selected year
      filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), int(float(row[4]))))
      f = open(filePath, 'a')
      f.write('  "malePop": [') # Write an open array to file
      for i in range(6, 28):
        f.write(str(intify(row[i])))
        if i < 27:
          f.write(',')
      f.write('],\n')
      f.close()
  dataFile.close()
  # Now fill in the female population
  print('Parsing female population data.')
  dataFile = codecs.open(os.path.join(CSV_DIR, f_POPULATION_BY_AGE_FEMALE), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(float(row[5])) == year: # Only record the selected year
      filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), int(float(row[4]))))
      f = open(filePath, 'a')
      f.write('  "femalePop": [') # Write an open array to file
      for i in range(6, 28):
        f.write(str(intify(row[i])))
        if i < 27:
          f.write(',')
      f.write('],\n')
      f.close()
  dataFile.close()

# Appends the birth data for the given year to the .js files
# in the output directory. Make sure that `generateFiles` has
# been called previously.
#
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def appendBirthData(year):
  # Parse through the birth data and append it to the file
  print('Parsing birth data.')
  dataFile = codecs.open(os.path.join(CSV_DIR, f_BIRTHS_BY_AGE_OF_MOTHER), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5].split('-')[1]) == year: # Only record the selected year
      filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), int(float(row[4]))))
      f = open(filePath, 'a')
      f.write('  "births": [') # Write an open array to file
      for i in range(6, 13):
        f.write(str(intify(row[i])))
        if i < 12:
          f.write(',')
      f.write('],\n')
      f.close()
  dataFile.close()

# Appends both the male and female mortality data to the .js files
# in the OUT_DIR. Make sure that `generateFiles` has been called.
#
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def appendMortalityData(year):
  # Start with the female mortality data
  print('Parsing female mortality data.')
  dataFile = codecs.open(os.path.join(CSV_DIR, f_DEATHS_BY_AGE_FEMALE), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5].split('-')[1]) == year: # Only record the selected year
      filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), int(float(row[4]))))
      f = open(filePath, 'a')
      f.write('  "femaleMortality": [') # Write an open array to file
      for i in range(6, 26):
        f.write(str(intify(row[i])))
        if i < 25:
          f.write(',')
      f.write('],\n')
      f.close()
  dataFile.close()
  # Now parse and append the male mortality data
  print('Parsing male mortality data.')
  dataFile = codecs.open(os.path.join(CSV_DIR, f_DEATHS_BY_AGE_MALE), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5].split('-')[1]) == year: # Only record the selected year
      filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), int(float(row[4]))))
      f = open(filePath, 'a')
      f.write('  "maleMortality": [') # Write an open array to file
      for i in range(6, 26):
        f.write(str(intify(row[i])))
        if i < 25:
          f.write(',')
      f.write('],\n')
      f.close()
  dataFile.close()
  # Now parse and append the infant mortality data
  print('Parsing infant mortality data.')
  dataFile = codecs.open(os.path.join(CSV_DIR, f_IMR_BOTH_SEXES), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), int(float(row[4]))))
    f = open(filePath, 'a')
    index = int(((year - 1955) / 5) + 5)
    f.write('  "infantMortality": %i,\n' % intify(row[index]))
    f.close()
  dataFile.close()

def appendMigrationData(year):
  print('Parsing migration data.')
  dataFile = codecs.open(os.path.join(CSV_DIR, f_NET_NUMBER_OF_MIGRANTS), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    filePath = os.path.join(OUT_DIR, '%s_%s.json' % (str(year), int(float(row[4]))))
    f = open(filePath, 'a')
    index = int(((year - 1955) / 5) + 5)
    f.write('  "netMigration": %i\n' % intify(row[index]))
    f.close()
  dataFile.close()

# Iterates through all of the files in the output directory
# and closes them all with an unindented right curly brace
def endFiles():
  print('Finishing up country files.')
  for fileName in os.listdir(OUT_DIR):
    f = open(os.path.join(OUT_DIR, fileName), 'a')
    f.write('}\n')
    f.close

#################################
#  Country List Helper Methods  #
#################################

def createCountryList(year):
  print('Generating the country list json.')

  countries = []
  
  dataFile = codecs.open(os.path.join(CSV_DIR, f_POPULATION_BY_AGE_MALE), 'r', encoding='latin1')
  data = csv.reader(dataFile)
  for row in data:
    if len(row) <= 0: continue # Just in case some "phantom" rows exist from MS CSV export
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(float(row[5])) == year: # Only record the requested year
      countryName = row[2]
      countryCode = row[4]
      fileName = '%s_%s.json' % (str(year), intify(countryCode))
      country = dict()
      country['id'] = intify(countryCode)
      country['countrycode'] = intify(countryCode)
      country['name'] = countryName
      country['alias'] = countryName
      country['filename'] = fileName
      countries.append(country)
  dataFile.close()

  countries = sortCountryList(countries)

  output_dir = os.path.split(OUT_DIR)[0] # The head of the path
  filePath = os.path.join(output_dir, 'countrylist.json')
  print('Writing the country list to file: ' + filePath)
  listFile = open(filePath, 'w') # Make the new file
  json.dump(countries, listFile)
  listFile.close()

def sortCountryList(countryList):
  print('Sorting the country list by name.')

  countryList_sorted = []

  try:
    countryList_sorted = sorted(countryList, key=lambda k: k['name'])
  except:
    print('There was an error sorting the country list.\nWriting countries in UN order instead.')
    countryList_sorted = countryList

  return countryList_sorted

#####################
#  Utility Methods  #
#####################

# Takes a string of numerical characters and removes spaces, etc.
# to turn them into proper integers. Returns an int value
# 
# @param value The numerical value read from the CSV file. This number
# may contain negatives, spaces, commas, etc.
#
# @return int An integer interpretation of the value parameter
def intify(value):
  newInt = 0;
  try:
    newInt = int(float(str(value).strip().replace(' ','')))
  except:
    # print('Unable to parse character: %s', value)
    pass
  
  return newInt

# Takes an int value number of bytes and returns a more readable
# string that states the size in KB, MB, GB, etc.
#
# @param bytes The number of bytes to convert. Assumes a positive value.
# 
# @return string A string representing the number of bytes passed
# as a parameter.
def sizeString(bytes):
  conversionFactor = 1024 # Could set to 1000 if you want
  sizeStr = ''
  if bytes < 1024:
    sizeStr = '%.2f B' % (bytes)
  elif bytes < math.pow(1024, 2):
    sizeStr = '%.2f KB' % (bytes / conversionFactor)
  elif bytes < math.pow(1024, 3):
    sizeStr = '%.2f MB' % (bytes / math.pow(conversionFactor, 2))
  elif bytes < math.pow(1024, 4):
    sizeStr = '%.2f GB' % (bytes / math.pow(conversionFactor, 3))
  else:
    sizeStr = 'Really Big.'
  return sizeStr




##################
#  Main Program  #
##################

print('\nIntlPop! Data File Generator\n============================\n')

if not validArgs():
  printUsage()
  quit() # Stop program execution if a valid date is not provided

dataYear = int(sys.argv[-1])

if '-d' in sys.argv or '--download' in sys.argv:
  try:
    import urllib3
    import xlrd
  except:
    print('You are missing python packages that are required to download the population data from the United Nations. Please run `$ pip install requests` and `$ pip install xlrd` before trying again.')
    exit(1)
  removeTmpFiles()
  downloadXLSData()
  makeCSVFiles()
  print()

if '-c' in sys.argv or '--countrylist' in sys.argv:
  createCountryList(dataYear)
  print()

generateFiles(dataYear) # Start the files
# Add data
appendPopData(dataYear)
appendBirthData(dataYear)
appendMortalityData(dataYear)
appendMigrationData(dataYear)
endFiles() # End the files

print()