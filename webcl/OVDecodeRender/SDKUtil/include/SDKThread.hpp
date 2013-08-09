#ifndef _SDK_THREAD_H_
#define _SDK_THREAD_H

#ifdef _WIN32
#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0501
#endif
#include "windows.h"
#include <deque>
#include "assert.h"
#define EXPORT __declspec(dllexport)

#else
#include "pthread.h"
#define EXPORT
#endif

namespace streamsdk
{
    //! Entry point for the thread
    //! prototype of the entry point in windows
    typedef void* (*threadFunc)(void*);

    //! \class ThreadLock
    //! \brief Provides a wrapper for locking primitives used to 
    //!  synchronize _CPU_ threads.
    //!
    //! Common usage would be:
    //!
    //!    CALLock lock;
    //!
    //!    ....
    //!
    //!    // Critical section begins
    //!
    //!    lock.lock();
    //!
    //!    .....
    //!
    //!    // Critical section ends
    //!
    //!    lock.unlock();
    //!

    class EXPORT ThreadLock
    {
        public:

           //! Constructor
           ThreadLock();

           //! Destructor
           ~ThreadLock();

           //! Returns true if the lock is already locked, false otherwise
           bool isLocked();

           //! Try to acquire the lock, if available continue, else wait on the lock
           void lock();

           //! Try to acquire the lock, if available, hold it, else continue doing something else
           bool tryLock();

           //! Unlock the lock and return
           void unlock();

        private:

           /////////////////////////////////////////////////////////////
           //!
           //! Private data members and methods
           //!
           
           //! System specific synchronization primitive
        #ifdef _WIN32
           CRITICAL_SECTION _cs;
        #else
           pthread_mutex_t _lock;
        #endif
    };


    //////////////////////////////////////////////////////////////
    //!
    //! \class Condition variable
    //! \brief Provides a wrapper for creating a condition variable
    //!
    //! This class provides a simple wrapper to a condition variable
    //!

    class CondVarImpl;
    class EXPORT CondVar
    {
        public:
            //! constructor and destructor. 
            //! Note that condition variable is not initialized in constructor 
            //! Separate functions available to initialize and destroy condition variable
            CondVar();
            ~CondVar();

            //! Initialize condition variable
            bool init(unsigned int maxThreadCount);

            //! Destroy condition variable
            bool destroy();

            //! Synchronize threads
            void syncThreads();


        private:

            //! Pointer to Implementation class
            CondVarImpl* _condVarImpl;

    };


    
    //////////////////////////////////////////////////////////////
    //!
    //! \class Thread
    //! \brief Provides a wrapper for creating a _CPU_ thread.
    //!
    //! This class provides a simple wrapper to a CPU thread/
    //!
    class EXPORT SDKThread
    {
        public:
           //! Thread constructor and destructor. Note that the thread is
           //! NOT created in the constructor. The thread creation takes
           //! place in the create method
           SDKThread();

           ~SDKThread();
           
           //! Wrapper for pthread_create. Pass the thread's entry
           //! point and data to be passed to the routine
           bool create(threadFunc func, void* arg);

           //! Wrapper for pthread_join. The calling thread
           //! will wait until _this_ thread exits
           bool join();

           //! Get the thread data passed by the application
           void* getData() { return _data; }

           //! Get the thread ID 
           unsigned int getID();

        private:

           /////////////////////////////////////////////////////////////
           //!
           //! Private data members and methods
           //!

        #ifdef _WIN32
           //!  store the handle
           HANDLE _tid;
        #else
           pthread_t _tid;
        #endif

           void *_data;

    };
}

#endif // _CPU_THREAD_H_
