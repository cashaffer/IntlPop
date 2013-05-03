# parseData.py
# Nate Beatty | February, 2013
# For the IntlPop! project
# 
# Parses CSV data from the given input directory
# and outputs a series of javascript files appropriate
# for use in the IntlPop! 3.0 web application.

import sys
import shutil
import os
import csv
import codecs

inputDir = '../CSV_Files/' # The directory containing the CSV files
outputDir = '../JS_Files/' # Where the JS output files will be created

# CSV FileNames (should be within the inputDir)
# Edit these filenames to reflect your own naming convention if necessary
f_POPULATION_BY_AGE_MALE = 'POPULATION_BY_AGE_MALE.CSV'
f_POPULATION_BY_AGE_FEMALE = 'POPULATION_BY_AGE_FEMALE.CSV'
f_DEATHS_BY_AGE_MALE = 'DEATHS_BY_AGE_MALE.CSV'
f_DEATHS_BY_AGE_FEMALE = 'DEATHS_BY_AGE_FEMALE.CSV'
f_BIRTHS_BY_AGE_OF_MOTHER = 'BIRTHS_BY_AGE_OF_MOTHER.CSV'
f_IMR_BOTH_SEXES = 'IMR_BOTH_SEXES.CSV'
f_NET_NUMBER_OF_MIGRANTS = 'NET_NUMBER_OF_MIGRANTS.CSV'


validYears = [2000, 2005, 2010]

# Checks that command line arguments are valid
# 
# @return true if valid, false otherwise.
def validArgs():
  if len(sys.argv) != 2 or int(sys.argv[1]) not in validYears:
    return False
  return True

# Prints a usage message
def printUsage():
  print('Usage: python parseData date\nDate can be 2000, 2005, or 2010.')

# Prints an informational message to the console
# appending "IntlPop!: " to each line.
def printMessage(message):
  print('IntlPop!: ' + str(message))

#################################
#  Country File Helper Methods  #
#################################

# Generates files for the given year
# 
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def generateFiles(year):
  # Create output directory
  if os.path.exists(outputDir):
    printMessage('Removing old data files.')
    shutil.rmtree(outputDir) # Remove the old output
  printMessage('Creating output directory at ' + outputDir)
  os.makedirs(outputDir)
  printMessage('Generating files for year %s data.' % (str(year)))
  # Make a file for each country based on the male population data
  data = csv.reader(open(inputDir + f_POPULATION_BY_AGE_MALE))

  for row in data:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5]) == year: # Only record the requested year
      countryName = row[2]
      countryCode = row[4]

      filePath = '%s%s_%s.js' % (outputDir, str(year), countryCode)

      f = open(filePath, 'w') # Make the new file

      # Write some preliminary stuff
      f.write('function setCountry () {\n')
      f.write('  var myCountry = new Object;\n')
      f.write('  myCountry.name = %s;\n' % (countryName))
      f.write('  myCountry.code = %s;\n' % (str(countryCode)))
      f.write('  myCountry.startYear = %s;\n' % (str(year)))

      f.close()

# Appends male and female population data for the given year
# to all of the .js files in the output directory. This method
# should be called immediately after `generateFiles`.
#
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def appendPopData(year):
  # Start with male population
  printMessage('Parsing male population data.')
  dataFile = csv.reader(open(inputDir + f_POPULATION_BY_AGE_MALE, 'r'))
  for row in dataFile:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5]) == year: # Only record the selected year
      filePath = '%s%s_%s.js' % (outputDir, str(year), row[4])
      f = open(filePath, 'a')
      f.write('  mycountry.malePop = [') # Write an open array to file
      for i in range(6, 28):
        f.write(str(row[i]).strip())
        if i < 27:
          f.write(',')
      f.write('];\n')
      f.close()
  # Now fill in the female population
  printMessage('Parsing female population data.')
  dataFile = csv.reader(open(inputDir + f_POPULATION_BY_AGE_FEMALE, 'r'))
  for row in dataFile:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5]) == year: # Only record the selected year
      filePath = '%s%s_%s.js' % (outputDir, str(year), row[4])
      f = open(filePath, 'a')
      f.write('  mycountry.femalePop = [') # Write an open array to file
      for i in range(6, 28):
        f.write(str(row[i]).strip())
        if i < 27:
          f.write(',')
      f.write('];\n')
      f.close()

# Appends the birth data for the given year to the .js files
# in the output directory. Make sure that `generateFiles` has
# been called previously.
#
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def appendBirthData(year):
  # Parse through the birth data and append it to the file
  printMessage('Parsing birth data.')
  dataFile = csv.reader(open(inputDir + f_BIRTHS_BY_AGE_OF_MOTHER, 'r'))
  for row in dataFile:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5].split('-')[1]) == year: # Only record the selected year
      filePath = '%s%s_%s.js' % (outputDir, str(year), row[4])
      f = open(filePath, 'a')
      f.write('  mycountry.births = [') # Write an open array to file
      for i in range(6, 13):
        f.write(str(row[i]).strip())
        if i < 12:
          f.write(',')
      f.write('];\n')
      f.close()

# Appends both the male and female mortality data to the .js files
# in the outputDir. Make sure that `generateFiles` has been called.
#
# @param year The year of the desired output data Must be 
# an integer equal to either 2000, 2005, or 2010.
def appendMortalityData(year):
  # Start with the female mortality data
  printMessage('Parsing female mortality data.')
  dataFile = csv.reader(open(inputDir + f_DEATHS_BY_AGE_FEMALE, 'r'))
  for row in dataFile:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5].split('-')[1]) == year: # Only record the selected year
      filePath = '%s%s_%s.js' % (outputDir, str(year), row[4])
      f = open(filePath, 'a')
      f.write('  mycountry.femaleMortality = [') # Write an open array to file
      for i in range(6, 26):
        f.write(str(row[i]).strip())
        if i < 25:
          f.write(',')
      f.write('];\n')
      f.close()
  # Now parse and append the male mortality data
  printMessage('Parsing male mortality data.')
  dataFile = csv.reader(open(inputDir + f_DEATHS_BY_AGE_MALE, 'r'))
  for row in dataFile:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5].split('-')[1]) == year: # Only record the selected year
      filePath = '%s%s_%s.js' % (outputDir, str(year), row[4])
      f = open(filePath, 'a')
      f.write('  mycountry.maleMortality = [') # Write an open array to file
      for i in range(6, 26):
        f.write(str(row[i]).strip())
        if i < 25:
          f.write(',')
      f.write('];\n')
      f.close()
  # Now parse and append the male mortality data
  printMessage('Parsing infant mortality data.')
  dataFile = csv.reader(open(inputDir + f_IMR_BOTH_SEXES, 'r'))
  for row in dataFile:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    filePath = '%s%s_%s.js' % (outputDir, str(year), row[4])
    f = open(filePath, 'a')
    f.write('  mycountry.infantMortality = ') # Write an open array to file
    
    if year == 2000:
      f.write(str(row[14]).strip())
    elif year == 2005:
      f.write(str(row[15]).strip())
    elif year == 2010:
      f.write(str(row[16]).strip())
    else:
      f.write('')

    f.write(';\n')
    f.close()

def appendMigrationData(year):
  printMessage('Parsing migration data.')
  dataFile = csv.reader(open(inputDir + f_NET_NUMBER_OF_MIGRANTS, 'r'))
  for row in dataFile:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    filePath = '%s%s_%s.js' % (outputDir, str(year), row[4])
    f = open(filePath, 'a')
    index = (((year - 1955) / 5) + 5)
    f.write('  mycountry.netMigration = %s;\n' % (str(int(row[int(index)]))))
    f.close()
    

# Iterates through all of the files in the output directory
# and closes them all with an unindented right curly brace
def endFiles():
  printMessage('Finishing up country files.')
  for fileName in os.listdir(outputDir):
    f = open(outputDir + fileName, 'a')
    f.write('  return myCountry;\n')
    f.write('}\n')
    f.close

#################################
#  Country List Helper Methods  #
#################################

def createCountryList(year):
  printMessage('Generating the country list.')

  filePath = '%scountrylist.js' % (outputDir)
  listFile = open(filePath, 'w') # Make the new file
  listFile.write('"use strict";\nvar countryList = [];\n\n') # Preliminaries

  data = csv.reader(open(inputDir + f_POPULATION_BY_AGE_MALE))
  counter = 0;

  for row in data:
    if (row[0] == '' or row[0] == 'Index'): continue # Only parse rows that contain data
    if int(row[5]) == year: # Only record the requested year
      
      countryName = row[2]
      countryCode = row[4]
      fileName = '%s_%s.js' % (str(year), countryCode)

      listFile.write('countryList[%i] = {}\n' % (counter))
      listFile.write('countryList[%i].name = "%s"\n' % (counter, countryName))
      listFile.write('countryList[%i].filename = "%s"\n' % (counter, fileName))

      counter += 1

##################
#  Main Program  #
##################

if not validArgs():
  printUsage()
  quit() # Stop program execution if a valid date is not provided

dataYear = int(sys.argv[1])

generateFiles(dataYear) # Start the files
# Add data
appendPopData(dataYear)
appendBirthData(dataYear)
appendMortalityData(dataYear)
appendMigrationData(dataYear)

endFiles() # End the files

createCountryList(dataYear)
