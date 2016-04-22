#!/usr/bin/python
#
#  automator.py
#  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
#
#  Created by Anthony Liot.
#  Copyright (c) 2013 Anthony Liot. All rights reserved.
#

import commands
import subprocess
import os
import sys
import multiprocessing
import time
from optparse import OptionParser
from functools import wraps
from time import gmtime, strftime

THREAD = False;

PROF_DATA = {}

def profile(fn):
    @wraps(fn)
    def with_profiling(*args, **kwargs):
        start_time = time.time()

        ret = fn(*args, **kwargs)

        elapsed_time = time.time() - start_time

        if fn.__name__ not in PROF_DATA:
            PROF_DATA[fn.__name__] = [0, []]
        PROF_DATA[fn.__name__][0] += 1
        PROF_DATA[fn.__name__][1].append(elapsed_time)

        return ret

    return with_profiling

def print_prof_data():
    for fname, data in PROF_DATA.items():
        max_time = max(data[1])
        avg_time = sum(data[1]) / len(data[1])

        s, mi = divmod(max_time*1000, 1000)
        m, s = divmod(s, 60)
        h, m = divmod(m, 60)

        smax = '%02d:%02d,%03d' % (m,s,mi)

        s, mi = divmod(avg_time*1000, 1000)
        m, s = divmod(s, 60)
        h, m = divmod(m, 60)

        savg = '%02d:%02d,%03d' % (m,s,mi)

        print "Function '%s' called %d times" % (fname, data[0]),
        print 'Execution time max: %s, average: %s' % (smax, savg)

def clear_prof_data():
    global PROF_DATA
    PROF_DATA = {}

list_repositories=["webcl-translator/webcl","webcl-cuda-nvidia","webcl-ocl-nvidia","webcl-osx-sample","webcl-ocltoys","webcl-davibu","webcl-book-samples","webcl-box2d","boost","freeimage"]

page_subfolder=["build_trans","build_cuda","build_nvidia","build_osx","build_toys","build_davibu","build_book","build_box"]

# Go Up folder
os.chdir("../");

# Grab the root folder
root_repositories = os.getcwd() + "/"

# Grab the website folder
page_repositories=os.getcwd() + "/webcl-translator-website/"

def worker_update(online,local,option):
    """thread worker_update function"""
    directory = root_repositories + local

    print "\tFunction worker 'update' ... "+str(directory)

    if os.path.isdir(directory):
      pr = subprocess.Popen( "/usr/bin/git reset --hard" , cwd = os.path.dirname( root_repositories + local + "/"), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()

      pr = subprocess.Popen( "/usr/bin/git pull" , cwd = os.path.dirname( root_repositories + local + "/"), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()

    else:
      pr = subprocess.Popen( "/usr/bin/git clone https://github.com/wolfviking0/"+str(online)+".git "+ option + " " + local, cwd = os.path.dirname( root_repositories ), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()

    return

@profile
def update(repo_list):
  print "\nFunction 'update' ... "+str(repo_list)
  jobs = []

  for i in repo_list:
    #if i.find("webcl-translator/webcl") != -1:
    #  var = raw_input("\tDo you want force update on the webcl-translator repository ? [y]es / [n]o\n").strip()
    #  if (var.find("y") == -1):
    #    continue

    p = multiprocessing.Process(target=worker_update, args=(i,i,""))
    jobs.append(p)
    p.start()

  # WebSite
  p = multiprocessing.Process(target=worker_update, args=("webcl-translator","webcl-website","-b gh-pages"))
  jobs.append(p)
  p.start()

  for j in jobs:
    j.join()

def worker_clean(repo,param):
    """thread worker_clean function"""
    directory = root_repositories + repo

    print "\tFunction worker 'clean' ... "+str(directory)

    if os.path.isdir(directory):
      pr = subprocess.Popen( "make clean"+param , cwd = os.path.dirname( root_repositories + repo + "/"), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()
    else:
      print "/!\ '",directory,"' doesn't exist, call with -u / --update options"

    return

@profile
def clean(repo_list,param):
  print "\nFunction 'clean' ... "+str(repo_list)
  jobs = []
  for i in repo_list:
    p = multiprocessing.Process(target=worker_clean, args=(i,param,))
    jobs.append(p)
    p.start()

  # Clean folder website
  for folder in page_subfolder:
    directory = page_repositories + folder
    if os.path.isdir(directory):
      pr = subprocess.Popen( "rm "+directory+"/*" , cwd = os.path.dirname( root_repositories ), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()
    else:
      print "/!\ Website repo %s doesn't exist ..." % (folder)

  for j in jobs:
    j.join()

def worker_build(repo,param,id):
    """thread worker_build function"""
    directory = root_repositories + repo

    print "\tFunction worker 'build' ... "+str(directory)

    if os.path.isdir(directory):
      pr = subprocess.Popen( "make all_"+str(id)+param , cwd = os.path.dirname( root_repositories + repo + "/"), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()

    else:
      print "/!\ '",directory,"' doesn't exist, call with -u / --update options"

    return

@profile
def build(repo_list,param):
  print "\nFunction 'build "+param+"' ... "+str(repo_list)
  if THREAD == False:
      for i in repo_list:

        print "\tFunction no thread 'build' ... "+str(root_repositories + i)

        pr = subprocess.Popen( "make"+param , cwd = os.path.dirname( root_repositories + i + "/"), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
        (out, error) = pr.communicate()
  else:
    jobs = []
    for i in repo_list:
      for j in range(1,4):
        p = multiprocessing.Process(target=worker_build, args=(i,param,j,))
        jobs.append(p)
        p.start()

    for j in jobs:
      j.join()

def worker_copy(folder,repo):
    """thread worker_copy function"""
    directory = page_repositories + folder

    print "\tFunction worker 'copy' ... "+str(directory)
    if not os.path.exists(directory):
      os.mkdir(directory)


    if os.path.isdir(directory):
      pr = subprocess.Popen( "cp -rf "+root_repositories + repo + "/js/ "+directory+"/" , cwd = os.path.dirname( root_repositories ), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()

      # Update index.html file
      f = open(directory+'/index.html','r')
      string = ""
      while 1:
        line = f.readline()
        if not line:break
        string += line

      f.close()

      start = string.find('<footer><center>')
      end = string.find('</center></footer>')

      footer = '<footer><center>webcl-translator is maintained by <a href="https://github.com/wolfviking0">Anthony Liot</a>.<br/>Last update : '+strftime("%Y-%m-%d %H:%M:%S", gmtime())
      string = string[:start] + footer + string[end:]

      f = open(directory+'/index.html','w')
      f.write(string)
      f.close()

    else:
      print "/!\ Website repo %s doesn't exist ..." % (folder)

    return

@profile
def copy(repo_list):
  print "\nFunction 'copy' ... "+str(repo_list)

  jobs = []
  for repo in repo_list:
    index = list_repositories.index(repo)
    folder = page_subfolder[index]
    p = multiprocessing.Process(target=worker_copy, args=(folder,repo))
    jobs.append(p)
    p.start()

  for j in jobs:
    j.join()

  # Update index.html file
  f = open(page_repositories+'/index.html','r')
  string = ""
  while 1:
    line = f.readline()
    if not line:break
    string += line

  f.close()

  start = string.find('<footer><center>')
  end = string.find('</center></footer>')

  footer = '<footer><center>webcl-translator is maintained by <a href="https://github.com/wolfviking0">Anthony Liot</a>.<br/>Last update : '+strftime("%Y-%m-%d %H:%M:%S", gmtime())
  string = string[:start] + footer + string[end:]

  f = open(page_repositories+'/index.html','w')
  f.write(string)
  f.close()
  #pr = subprocess.Popen( "ln -Fs "+page_repositories+"index.html "+root_repositories+"webcl-samples.html", cwd = os.path.dirname( root_repositories ), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
  #(out, error) = pr.communicate()

@profile
def launch(parser,options):
  global THREAD
  THREAD = options.thread

  # Multi process
  cores = multiprocessing.cpu_count()
  # Keep one cores for system
  cores -= 1;

  # First check if how many option are enabled
  num_opt_enabled = 0
  for item in options.__dict__:
    if options.__dict__[item]:
      num_opt_enabled+=1

  if (options.thread):
    num_opt_enabled-=1

  if (options.original):
    num_opt_enabled-=1

  if (options.debug):
    num_opt_enabled-=1

  if (options.fastcomp):
    num_opt_enabled-=1

  if (options.native):
    num_opt_enabled-=1

  if (len(options.repo) > 0):
    num_opt_enabled-=1

  # Paramater for makefile
  param = ""

  if options.fastcomp:
    param += " FAST=1 " # Default value inside makefile
  else:
    param += " FAST=0 "

  if options.debug:
    param += " DEB=1 "
  else:
    param += " DEB=0 " # Default value inside makefile

  if options.original:
    param += " ORIG=1 "
  else:
    param += " ORIG=0 " # Default value inside makefile

  if ( not ( ( all(repo.isdigit() for repo in options.repo) ) and all( ( int(repo) >= 0 and int(repo) <= 6 ) for repo in options.repo) ) ) :
    print "/!\ You must use --repo with integer between 0 & 6"
    parser.print_help()
    exit(-1)

  # \todo Need to add the possibility
  # Check Error case
  if (options.all and num_opt_enabled != 1):
    print "/!\ You must use --all alone or with --repo and/or --debug options"
    parser.print_help()
    exit(-1)

  repolist = []

  if (len(options.repo) > 0):
    for repo in options.repo:
      repolist.append(str(list_repositories[int(repo)]))
  else :
    # Don't update the first by default
    for repo in list_repositories[0:-2]:
      repolist.append(repo)

  # 1 Clone or/and Update all the repositories of sample
  if(options.update or options.all):
    update(repolist)
    os.chdir(root_repositories)

  # 2 Clean or Only Clean
  if(options.clean or options.all):
    clean(repolist,param)
    os.chdir(root_repositories)

  if options.native:
      param = " NAT=1 "
      build(repolist,param)
      os.chdir(root_repositories)
  else:
    # 3 Build without validator
    if(options.without_validator or options.all):
      build(repolist,param)
      os.chdir(root_repositories)

    # 4 Build with validator
    if(options.validator or options.all):
      build(repolist," VAL=1" + param)
      os.chdir(root_repositories)

  # 5 Copy
  if(options.copy or options.all):
    copy(repolist)
    os.chdir(root_repositories)

def list_repo_callback(option, opt, value, parser):
  setattr(parser.values, option.dest, value.split(','))

def main():
  usage = "usage: %prog [opts]"
  parser = OptionParser(usage=usage)


  parser.add_option("-a", "--all",
                    action="store_true", dest="all", default=False,
                    help="complete process -u -e -w -v -c -p", metavar="ALL")

  parser.add_option("-u", "--update",
                    action="store_true", dest="update", default=False,
                    help="update the sample repositories", metavar="UPDATE")

  parser.add_option("-p", "--profile",
                    action="store_true", dest="profile", default=False,
                    help="print the profile log", metavar="PROFILE")

  parser.add_option("-o", "--original",
                    action="store_true", dest="original", default=False,
                    help="Build using emscripten fork not submodule", metavar="ORIGNAL")

  parser.add_option("-v", "--validator",
                    action="store_true", dest="validator", default=False,
                    help="Build with webcl-validator enabled", metavar="VALIDATOR")

  parser.add_option("-w", "--without-validator",
                    action="store_true", dest="without_validator", default=False,
                    help="Build without webcl-validator enabled", metavar="WITHOUT_VALIDATOR")

  parser.add_option("-d", "--debug",
                    action="store_true", dest="debug", default=False,
                    help="enable all debug flag for webcl-translator", metavar="DEBUG")

  parser.add_option("-e", "--erase",
                    action="store_true", dest="clean", default=False,
                    help="clean all the javascript generated and build", metavar="CLEAN")

  parser.add_option("-c", "--copy",
                    action="store_true", dest="copy", default=False,
                    help="copy all the javascript generated after build", metavar="COPY")

  parser.add_option("-t", "--thread",
                    action="store_true", dest="thread", default=False,
                    help="use thread build", metavar="TREAD")

  parser.add_option("-f", "--fastcomp",
                    action="store_true", dest="fastcomp", default=False,
                    help="use fastcomp build", metavar="FAST")

  parser.add_option("-n", "--native",
                    action="store_true", dest="native", default=False,
                    help="use c++ / opencl build", metavar="NAT")

  parser.add_option('-r', '--repo',
                    action='callback', dest="repo", type='string', default='',
                    callback=list_repo_callback,
                    help="work only on the repository list :\t\t\t\
                    0 : webcl-translator/webcl\t\t\t\
                    1 : webcl-cuda-sample\t\t\t\
                    2 : webcl-nvidia-sample\t\t\t\
                    3 : webcl-osx-sample\t\t\t\
                    4 : webcl-ocltoys\t\t\t\
                    5 : webcl-davibu\t\t\t\
                    6 : webcl-book-samples\t\t\t\
                    7 : webcl-box2d", metavar="0,2,...")

  (options, args) = parser.parse_args()

  # Launch the different step of the process
  launch(parser,options)

  # If we want profile
  if(options.profile or options.all):
    print_prof_data()

if __name__ == "__main__":
  main()

