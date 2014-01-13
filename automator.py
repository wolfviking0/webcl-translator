#!/usr/bin/python
# Python 2:50 vs Shell 6:18
import commands
import subprocess
import os
import sys
import multiprocessing
import time
from optparse import OptionParser
from functools import wraps

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

list_repositories=["webcl-translator/webcl","webcl-osx-sample","webcl-ocltoys","webcl-davibu","webcl-book-samples","boost","freeimage"]

page_subfolder=["build_trans","build_osx","build_toys","build_davibu","build_book"]

# Go Up folder
os.chdir("../");

# Grab the root folder
root_repositories = os.getcwd() + "/"

# Grab the website folder
page_repositories=os.getcwd() + "/webcl-website/"

def worker_update(online,local,option):
    """thread worker_update function"""
    directory = root_repositories + local

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
  print "Function 'update' ..."
  jobs = []
  
  # WebSite
  p = multiprocessing.Process(target=worker_update, args=("webcl-translator","webcl-website","-b gh-pages"))
  jobs.append(p)
  p.start()

  for i in list_repositories[1:-2]:
    p = multiprocessing.Process(target=worker_update, args=(i,i,""))
    jobs.append(p)
    p.start()

  for j in jobs:
    j.join()

def worker_clean(repo,param):
    """thread worker_clean function"""
    directory = root_repositories + repo

    if os.path.isdir(directory):
      pr = subprocess.Popen( "make clean"+param , cwd = os.path.dirname( root_repositories + repo + "/"), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()  
    else:
      print "/!\ '",directory,"' doesn't exist, call with -u / --update options"

    return    

@profile
def clean(repo_list,param):
  print "Function 'clean' ..."
  jobs = []
  for i in list_repositories[:-2]:
    p = multiprocessing.Process(target=worker_clean, args=(i,param,))
    jobs.append(p)
    p.start()

  for j in jobs:
    j.join() 

def worker_build(repo,param,id):
    """thread worker_build function"""
    directory = root_repositories + repo

    if os.path.isdir(directory):
      pr = subprocess.Popen( "make all_"+str(id)+param , cwd = os.path.dirname( root_repositories + repo + "/"), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()  

      #if (len(error)):
      #  print "/!\ Cmd : 'make all_"+str(id)+param+"' on '",directory,"' make an error : "
      #  print error

    else:
      print "/!\ '",directory,"' doesn't exist, call with -u / --update options"

    return   

@profile
def build(repo_list,param):
  print "Function 'build' ..."
  jobs = []
  for i in list_repositories[:-2]:
    for j in range(1,4):
      p = multiprocessing.Process(target=worker_build, args=(i,param,j,))
      jobs.append(p)
      p.start()

  for j in jobs:
    j.join()   

def worker_copy(folder,repo):
    """thread worker_copy function"""
    directory = page_repositories + folder

    if os.path.isdir(directory):
      pr = subprocess.Popen( "cp -rf "+root_repositories + repo + "/build/ "+directory+"/" , cwd = os.path.dirname( root_repositories ), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
      (out, error) = pr.communicate()  
    else:
      print "/!\ Website repo %s doesn't exist ..." % (folder)

    return   

@profile
def copy(repo_list):
  print "Function 'copy' ..."

  jobs = []
  for (folder,repo) in zip(page_subfolder, list_repositories[:-2]):
    p = multiprocessing.Process(target=worker_copy, args=(folder,repo))
    jobs.append(p)
    p.start()

  for j in jobs:
    j.join()

  pr = subprocess.Popen( "ln -Fs "+page_repositories+"index.html "+root_repositories+"webcl-samples.html", cwd = os.path.dirname( root_repositories ), shell = True, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
  (out, error) = pr.communicate()  

@profile
def launch(parser,options):
  # Multi process 
  cores = multiprocessing.cpu_count()
  # Keep one cores for system
  cores -= 1;

  # First check if how many option are enabled
  num_opt_enabled = 0
  for item in options.__dict__:
    if options.__dict__[item]:
      num_opt_enabled+=1

  # Paramater for makefile
  param = " "
  if options.debug:
    param += " DEB=1 "

  # \todo Need to add the possibility
  # Check Error case
  if ( options.all and num_opt_enabled > 1 ):
    print "/!\ You must use --all alone"
    parser.print_help()
    exit(-1)

  # 1 Clone or/and Update all the repositories of sample
  if(options.update or options.all):
    update(options.repo)
    os.chdir(root_repositories)

  # 2 Clean or Only Clean
  if(options.clean or options.all):
    clean(options.repo,param)
    os.chdir(root_repositories)

  # 3 Build without validator
  if(options.without_validator or options.all):
    build(options.repo,param)
    os.chdir(root_repositories)
  
  # 4 Build with validator
  if(options.validator or options.all):
    build(options.repo," VAL=1" + param)
    os.chdir(root_repositories)

  # 5 Copy
  if(options.copy or options.all):
    copy(options.repo)
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

  parser.add_option('-r', '--repo',
                    action='callback', dest="repo", type='string', default='',
                    callback=list_repo_callback,
                    help="work only on the repository list :\t\t\twebcl-translator/webcl,webcl-osx-sample,webcl-ocltoys,webcl-davibu,webcl-book-samples", metavar="A,B,...")

  '''
  parser.add_option("-U", "--only-update",
                    action="store_true", dest="onlyclean", default=False,
                    help="only update all the javascript generated", metavar="ONLY_CLEAN")

  parser.add_option("-E", "--only-erase",
                    action="store_true", dest="onlyclean", default=False,
                    help="only clean all the javascript generated", metavar="ONLY_CLEAN")

  parser.add_option("-C", "--only-copy",
                    action="store_true", dest="onlycopy", default=False,
                    help="only copy all the javascript generated", metavar="ONLY_COPY")
  '''

  (options, args) = parser.parse_args()

  # Launch the different step of the process
  launch(parser,options)

  # If we want profile
  if(options.profile or options.all):
    print_prof_data()

if __name__ == "__main__":
  main()

