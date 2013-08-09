#include "SDKThread.hpp"

#include <stdio.h>
#include <stdlib.h>
#ifdef _WIN32
#include <process.h>
#endif

// suppress the warning #810 if intel compiler is used.
#if defined(__INTEL_COMPILER)
#pragma warning(disable : 810)
#endif 

//#define PRINT_COND_VAR_ERROR_MSG
#ifdef PRINT_COND_VAR_ERROR_MSG
#define PRINT_ERROR_MSG(errorcode, msg) \
    if(errorcode != 0) \
        printf("%s \n", msg)
#else
#define PRINT_ERROR_MSG(errorcode, msg)    
#endif // PRINT_COND_VAR_ERROR_MSG

namespace streamsdk
{
    //! pack the function pointer and data inside this struct
    typedef struct __argsToThreadFunc
    {
        threadFunc func;
        void* data;

    } argsToThreadFunc;


    #ifdef _WIN32
    //! Windows thread callback - invokes the callback set by
    //! the application in Thread constructor
    unsigned _stdcall win32ThreadFunc(void* args)
    {
        argsToThreadFunc* ptr = (argsToThreadFunc*) args;
        SDKThread *obj = (SDKThread *) ptr->data;
        ptr->func(obj->getData());
        delete args;
        return 0;
    }
    #endif

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Constructor
    //!
    /////////////////////////////////////////////////////////////////////////

    ThreadLock::ThreadLock()
    {
    #ifdef _WIN32
        InitializeCriticalSection(&_cs);
    #else
        pthread_mutex_init(&_lock, NULL);
    #endif
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Destructor
    //!
    /////////////////////////////////////////////////////////////////////////

    ThreadLock::~ThreadLock()
    {
    #ifdef _WIN32
        DeleteCriticalSection(&_cs);
    #else
        pthread_mutex_destroy(&_lock);
    #endif
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Test whether the lock is already acquired
    //! Return values :
    //! true (if the lock is already acquired)
    //! false (if the lock is free)
    //!
    /////////////////////////////////////////////////////////////////////////

    bool
    ThreadLock::isLocked()
    {
    #ifdef _WIN32
        return (_cs.LockCount != ~0x0);
    #else
        if(pthread_mutex_trylock(&_lock) != 0)
            return true;

        pthread_mutex_unlock(&_lock);
        return false;
    #endif
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Try to acquire the lock, wait for the lock if unavailable
    //! else hold the lock and enter the protected area
    //!
    /////////////////////////////////////////////////////////////////////////

    void
    ThreadLock::lock()
    {
    #ifdef _WIN32
        EnterCriticalSection(&_cs);
    #else
        pthread_mutex_lock(&_lock);
    #endif
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Try to acquire the lock, if unavailable the function returns
    //! false and returns true if available(enters the critical
    //! section as well in this case).
    //!
    /////////////////////////////////////////////////////////////////////////

    bool
    ThreadLock::tryLock()
    {
    #ifdef _WIN32
        return (TryEnterCriticalSection(&_cs) != 0);
    #else
        return !((bool)pthread_mutex_trylock(&_lock));
    #endif
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Unlock the lock
    //!
    /////////////////////////////////////////////////////////////////////////

    void
    ThreadLock::unlock()
    {
    #ifdef _WIN32
        LeaveCriticalSection(&_cs);
    #else
        pthread_mutex_unlock(&_lock);
    #endif
    }

    //////////////////////////////////////////////////////////////
    //!
    //! \class Implementation of Condition variable class
    //! \brief Provides Implementation of condition variable
    //!
    //!

    class CondVarImpl
    {
        public:
            //! constructor and destructor. 
            //! Note that condition variable is not initialized in constructor 
            //! Separate functions available to initialize and destroy condition variable
            CondVarImpl();
            ~CondVarImpl();

            //! Initialize condition variable
            bool init(unsigned int maxThreadCount);

            //! Destroy condition variable
            bool destroy();

            //! Synchronize threads
            void syncThreads();


        private:

            /////////////////////////////////////////////////////////////
            //!
            //! Private data members and methods
            //!

           
            //! Acquires the lock once. 
            void beginSynchronized();

            //! Releases the lock once. 
            int endSynchronized();

#ifdef _WIN32

            //! Waits for a notification. 
            DWORD wait(DWORD dwMillisecondsTimeout = INFINITE, BOOL bAlertable = FALSE);

            //! Notifies the waiting threads 
            BOOL broadcast();

            //! Creates an initially non-signalled auto-reset event and
            //! pushes the handle to the event onto the wait set. The
            //! return value is the event handle. In case of failure,
            //! NULL is returned.
            HANDLE _push();

            //! Pops the first handle off the wait set. Returns NULL if the
            //! wait set was empty.
            HANDLE _pop();

            //! Checks whether the calling thread is holding the lock.
            BOOL _lockHeldByCallingThread();


            //! STL deque that implements the wait set.
            std::deque<HANDLE> _deqWaitSet;

            //! Critical section to protect access to wait set.
            CRITICAL_SECTION _critsecWaitSetProtection;

            //! Critical section for external synchronization.
            CRITICAL_SECTION _condVarLock;

            //! The monitor must keep track of how many times the lock
            //! has been acquired, because Win32 does not divulge this
            //! information to the client programmer.
            int _nLockCount;

 #else

            //! condition variable
            pthread_cond_t _condVar;

            //! Mutex for condition variable _condVar
            pthread_mutex_t _condVarLock;

#endif

            //! Maximum threads in a group
            unsigned int _maxThreads;

            //! Number of threads waiting 
            unsigned int _count;

    };

    /////////////////////////////////////////////////////////////////////////
    //! Constructor
    /////////////////////////////////////////////////////////////////////////

    CondVar::CondVar()
    {
        _condVarImpl = new CondVarImpl();
    }

    /////////////////////////////////////////////////////////////////////////
    //! Destructor
    /////////////////////////////////////////////////////////////////////////

    CondVar::~CondVar()
    {
        delete _condVarImpl;
    }


    ////////////////////////////////////////////////////////////////////////
    //! Initialize condition variable and required locks
    /////////////////////////////////////////////////////////////////////////

    bool
    CondVar::init(unsigned int maxThreadCount)
    {
        return _condVarImpl->init(maxThreadCount);
    }

    /////////////////////////////////////////////////////////////////////////
    //! Destroy condition variable state and Lock states
    /////////////////////////////////////////////////////////////////////////

    bool
    CondVar::destroy()
    {
        return _condVarImpl->destroy();
    }

    /////////////////////////////////////////////////////////////////////////
    //! Synchronize all the threads 
    /////////////////////////////////////////////////////////////////////////

    void 
    CondVar::syncThreads()
    {
        _condVarImpl->syncThreads();
    }


    
    /////////////////////////////////////////////////////////////////////////
    //! Constructor
    /////////////////////////////////////////////////////////////////////////

    CondVarImpl::CondVarImpl() : _count(0xFFFFFFFF), _maxThreads(0xFFFFFFFF)
    {
    }

    /////////////////////////////////////////////////////////////////////////
    //! Destructor
    /////////////////////////////////////////////////////////////////////////

    CondVarImpl::~CondVarImpl()
    {
    }


    ////////////////////////////////////////////////////////////////////////
    //! Initialize condition variable and required locks
    /////////////////////////////////////////////////////////////////////////

    bool
    CondVarImpl::init(unsigned int maxThreadCount)
    {
        int rc = 0;

        //! Initialize count and maxThreads
        _count = 0xFFFFFFFF;
        _maxThreads = maxThreadCount;

    #ifdef _WIN32
        _nLockCount = 0;
        // Initialize the critical section that protects access to
        // the wait set. There is no way to check for errors here.
        InitializeCriticalSection(&_critsecWaitSetProtection);

        // Initialize the critical section that provides synchronization
        // to the client. There is no way to check for errors here.
        InitializeCriticalSection(&_condVarLock);

    #else
        
        pthread_mutex_init(&_condVarLock, NULL);
        PRINT_ERROR_MSG(rc, "Failed to initialize condition variable lock");

        rc = pthread_cond_init(&_condVar, NULL);
        PRINT_ERROR_MSG(rc, "Failed to Initialize condition variable");

    #endif

        if(rc != 0)
            return false;

        return true;
    }

    /////////////////////////////////////////////////////////////////////////
    //! Destroy condition variable state and Lock states
    /////////////////////////////////////////////////////////////////////////

    bool
    CondVarImpl::destroy()
    {
        int rc = 0;

    #ifdef _WIN32

        // Uninitialize critical sections. Win32 allows no error checking
        // here.
        DeleteCriticalSection(&_critsecWaitSetProtection);
        DeleteCriticalSection(&_condVarLock);

        // Destroying this thing while threads are waiting is a client
        // programmer mistake.
        assert( _deqWaitSet.empty() );

    #else

        //! Destroy condition variable lock
        pthread_mutex_destroy(&_condVarLock);
        PRINT_ERROR_MSG(rc, "Failed to destroy condition variable lock");

        //! Destroy condition variable
        rc = pthread_cond_destroy(&_condVar);
        PRINT_ERROR_MSG(rc, "Failed to destroy condition variable");

    #endif

        if(rc != 0)
            return false;

        return true;
    }

    /////////////////////////////////////////////////////////////////////////
    //! Synchronize all the threads 
    /////////////////////////////////////////////////////////////////////////

    void 
    CondVarImpl::syncThreads()
    {

        //! Lock condition variable lock
        beginSynchronized();
        
        int rc = 0;    
        
        //! count threads
        if(_count == 0xFFFFFFFF)
            _count = 0;
        else
        {
            _count++;
        }

        if(_count >= _maxThreads - 1)
        {
            //! Set to highest value before broadcasting
            _count = 0xFFFFFFFF;
            //! Unblock all waiting threads
    #ifdef _WIN32
            rc = broadcast();  
            if(rc == 0)
               printf("Problem while calling broadcast\n");

    #else
            rc = pthread_cond_broadcast(&_condVar);
            PRINT_ERROR_MSG(rc, "Problem while calling pthread_cond_broadcast()");
    #endif // _WIN32

        }
        else
        {
            //! Block on a condition variable
    #ifdef _WIN32
            wait();
    #else
            if(_count < _maxThreads - 1)
            {
                rc = pthread_cond_wait(&_condVar, &_condVarLock);
                PRINT_ERROR_MSG(rc, "Problem while calling pthread_cond_wait()");
            }
    #endif // _WIN32
        }
        
        //! Unlock condition variable lock
        endSynchronized();
    }
    #ifdef _WIN32

    /////////////////////////////////////////////////////////////////////////
    //! Waits for a notification. 
    /////////////////////////////////////////////////////////////////////////
    DWORD CondVarImpl::wait(DWORD dwMillisecondsTimeout/* = INFINITE*/, BOOL bAlertable/* = FALSE */)
    {
        if(! _lockHeldByCallingThread())
        {
            ::SetLastError(ERROR_INVALID_FUNCTION); // for the lack of better...
            return WAIT_FAILED;
        }

        // Enter a new event handle into the wait set.
        HANDLE hWaitEvent = _push();
        if(NULL == hWaitEvent)
            return WAIT_FAILED;

        // Store the current lock count for re-acquisition.
        int nThisThreadsLockCount = _nLockCount;
        _nLockCount = 0;

        // Release the synchronization lock the appropriate number of times.
        // Win32 allows no error checking here.
        for(int i = 0; i < nThisThreadsLockCount; ++i)
            LeaveCriticalSection(&_condVarLock);

        // NOTE: Conceptually, releasing the lock and entering the wait
        // state is done in one atomic step. Technically, that is not
        // true here, because we first leave the critical section and
        // then, in a separate line of code, call WaitForSingleObjectEx.
        // The reason why this code is correct is that our thread is placed
        // in the wait set *before* the lock is released. Therefore, if
        // we get preempted right here and another thread notifies us, then
        // that notification will *not* be missed: the wait operation below
        // will find the event signalled.
        
        // Wait for the event to become signalled.
        DWORD dwWaitResult = ::WaitForSingleObjectEx(hWaitEvent, dwMillisecondsTimeout, bAlertable);

        // If the wait failed, store the last error because it will get
        // overwritten when acquiring the lock.
        DWORD dwLastError;
        if(WAIT_FAILED == dwWaitResult)
            dwLastError = ::GetLastError();

        // Acquire the synchronization lock the appropriate number of times.
        // Win32 allows no error checking here.
        for(int j = 0; j < nThisThreadsLockCount; ++j)
            EnterCriticalSection(&_condVarLock);

        // Restore lock count.
        _nLockCount = nThisThreadsLockCount;

        // Close event handle
        if(! CloseHandle(hWaitEvent))
            return WAIT_FAILED;

        if(WAIT_FAILED == dwWaitResult)
            ::SetLastError(dwLastError);
        
        return dwWaitResult;
    }


    /////////////////////////////////////////////////////////////////////////
    //! Notifies the waiting threads 
    /////////////////////////////////////////////////////////////////////////
    BOOL CondVarImpl::broadcast()
    {
        // Signal all events on the deque, then clear it. Win32 allows no
        // error checking on entering and leaving the critical section.
        EnterCriticalSection(&_critsecWaitSetProtection);
        std::deque<HANDLE>::const_iterator it_run = _deqWaitSet.begin();
        std::deque<HANDLE>::const_iterator it_end = _deqWaitSet.end();
        for( ; it_run < it_end; ++it_run)
        {
            if(! SetEvent(*it_run))
                return FALSE;
        }
        _deqWaitSet.clear();
        LeaveCriticalSection(&_critsecWaitSetProtection);
        
        return TRUE;
    }


    /////////////////////////////////////////////////////////////////////////
    //! Creates an initially non-signalled auto-reset event and
    //! pushes the handle to the event onto the wait set. The
    //! return value is the event handle. In case of failure,
    //! NULL is returned.
    /////////////////////////////////////////////////////////////////////////
    HANDLE CondVarImpl::_push()
    {
        // Create the new event.
        HANDLE hWaitEvent = ::CreateEvent(NULL, // no security
                                          FALSE, // auto-reset event
                                          FALSE, // initially unsignalled
                                          NULL); // string name
          
        if(NULL == hWaitEvent)
        {
            return NULL;
        }

        // Push the handle on the deque.
        EnterCriticalSection(&_critsecWaitSetProtection);
        _deqWaitSet.push_back(hWaitEvent);
        LeaveCriticalSection(&_critsecWaitSetProtection);
        
        return hWaitEvent;
    }


    /////////////////////////////////////////////////////////////////////////
    //! Pops the first handle off the wait set. Returns NULL if the
    //! wait set was empty.
    /////////////////////////////////////////////////////////////////////////
    HANDLE CondVarImpl::_pop()
    {
        // Pop the first handle off the deque.
        EnterCriticalSection(&_critsecWaitSetProtection);
        HANDLE hWaitEvent = NULL; 
        if(0 != _deqWaitSet.size())
        {
            hWaitEvent = _deqWaitSet.front();
            _deqWaitSet.pop_front();
        }
        LeaveCriticalSection(&_critsecWaitSetProtection);
        
        return hWaitEvent;
    }


    /////////////////////////////////////////////////////////////////////////
    //! Checks whether the calling thread is holding the lock. 
    /////////////////////////////////////////////////////////////////////////
    BOOL CondVarImpl::_lockHeldByCallingThread()
    {
        BOOL bTryLockResult = TryEnterCriticalSection(&_condVarLock);

        // If we didn't get the lock, someone else has it.
        if(!bTryLockResult)
        {
            return FALSE;
        }

        // If we got the lock, but the lock count is zero, then nobody had it.
        if(0 == _nLockCount)
        {
            assert(bTryLockResult);
            LeaveCriticalSection(&_condVarLock);
            return FALSE;
        }

        // Release lock once. NOTE: we still have it after this release.
        // Win32 allows no error checking here.
        assert(bTryLockResult && 0 < _nLockCount);
        LeaveCriticalSection(&_condVarLock);
        
        
        return TRUE;
    }
    #endif //! _WIN32

    /////////////////////////////////////////////////////////////////////////
    //! Acquires the lock once. 
    /////////////////////////////////////////////////////////////////////////
    void CondVarImpl::beginSynchronized()
    { 

    #ifdef _WIN32
        // Acquire lock. Win32 allows no error checking here.
        EnterCriticalSection(&_condVarLock); 

        // Record the lock acquisition for proper release in Wait().
        ++_nLockCount;
    #else
        pthread_mutex_lock(&_condVarLock);
    #endif // _WIN32
    }

    /////////////////////////////////////////////////////////////////////////
    //! Releases the lock once.  
    /////////////////////////////////////////////////////////////////////////
    int CondVarImpl::endSynchronized()
    { 
    #ifdef _WIN32
        if(! _lockHeldByCallingThread())
        {
            ::SetLastError(ERROR_INVALID_FUNCTION); // for the lack of better...
            return 0;
        }
        // Record the lock release for proper release in Wait().
        --_nLockCount;

        // Release lock. Win32 allows no error checking here.
        ::LeaveCriticalSection(&_condVarLock);    
    #else
        pthread_mutex_unlock(&_condVarLock);
    #endif // _WIN32
        
        return 1;
    }


    /////////////////////////////////////////////////////////////////////////
    //!
    //! Constructor
    //!
    /////////////////////////////////////////////////////////////////////////

    SDKThread::SDKThread() : _tid(0), _data(0)
    {
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Destructor
    //!
    /////////////////////////////////////////////////////////////////////////

    SDKThread::~SDKThread()
    {
    #ifdef _WIN32
        if(_tid)
        {
            CloseHandle(_tid);
            _tid = 0;
        }
    #endif
    }


    //////////////////////////////////////////////////////////////
    //!
    //! Create a new thread and return the status of the operation
    //!
    /////////////////////////////////////////////////////////////////////////

    bool
    SDKThread::create(threadFunc func, void *arg)
    {
        // Save the data internally
        _data = arg;

    #ifdef _WIN32
        // Setup the callback struct for thread function and pass to the
        // begin thread routine
        // xxx The following struct is allocated but never freed!!!!
        argsToThreadFunc *args =  new argsToThreadFunc;
        args->func = func;
        args->data = this;

        _tid = (HANDLE)_beginthreadex(NULL, 0, win32ThreadFunc, args, 0, NULL);
        if(_tid == 0)
        {
            return false;
        }

    #else
        //! Now create the thread with pointer to self as the data
        int retVal = pthread_create(&_tid, NULL, func, arg);
        if(retVal != 0)
        {
            return false;
        }

    #endif

        return true;
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Return the thread ID for the current Thread
    //!
    /////////////////////////////////////////////////////////////////////////

    unsigned int
    SDKThread::getID()
    {
#if defined(__MINGW32__) && defined(__MINGW64_VERSION_MAJOR)
        //This is to fix compilation issue with MinGW64-w64
        return (unsigned int)(long long)_tid;
#else
        return (unsigned int)_tid;
#endif //__MINGW32__  and __MINGW64_VERSION_MAJOR
        
    }

    /////////////////////////////////////////////////////////////////////////
    //!
    //! Wait for this thread to join
    //!
    /////////////////////////////////////////////////////////////////////////

    bool
    SDKThread::join()
    {
        if(_tid)
        {
    #ifdef _WIN32
            DWORD rc = WaitForSingleObject(_tid, INFINITE);
            CloseHandle(_tid);

            if(rc == WAIT_FAILED)
            {
                printf("Bad call to function(invalid handle?)\n");
            }
    #else
            int rc = pthread_join(_tid, NULL);
    #endif

            _tid = 0;

            if(rc != 0)
                return false;
        }

        return true;
    }
}
