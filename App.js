import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, UserPlus, LogIn, LogOut, Users, Trash2, Edit, Save, XCircle, Sun, Moon, UserCheck, Coffee, PartyPopper, Palette, Info, Printer, ShieldAlert, Loader2 } from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut 
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    setDoc
} from "firebase/firestore";


// --- Firebase Configuration ---
// This is the configuration you provided.
const firebaseConfig = {
    apiKey: "AIzaSyAoWXaO7uleDu-q0djEuGJUFr0FxGrLO38",
    authDomain: "babo-schedule-app.firebaseapp.com",
    projectId: "babo-schedule-app",
    storageBucket: "babo-schedule-app.appspot.com",
    messagingSenderId: "141102385999",
    appId: "1:141102385999:web:3cf842db56b08e048f933a",
    measurementId: "G-F1W30WDPGT"
};


// --- Initialize Firebase ---
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}


// --- Helper Functions & Constants ---
const getThaiMonthName = (monthIndex) => {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return months[monthIndex];
};

const publicHolidays = {
    '2025-01-01': 'วันขึ้นปีใหม่',
    '2025-02-12': 'วันมาฆบูชา',
    '2025-04-06': 'วันจักรี',
    '2025-04-13': 'วันสงกรานต์',
    '2025-04-14': 'วันสงกรานต์',
    '2025-04-15': 'วันสงกรานต์',
    '2025-05-01': 'วันแรงงานแห่งชาติ',
    '2025-05-05': 'วันฉัตรมงคล',
    '2025-05-12': 'วันวิสาขบูชา',
    '2025-06-03': 'วันเฉลิมฯ พระราชินี',
    '2025-07-11': 'วันอาสาฬหบูชา',
    '2025-07-28': 'วันเฉลิมฯ ร.10',
    '2025-08-12': 'วันแม่แห่งชาติ',
    '2025-10-13': 'วันคล้ายวันสวรรคต ร.9',
    '2025-10-23': 'วันปิยมหาราช',
    '2025-12-05': 'วันพ่อแห่งชาติ',
    '2025-12-10': 'วันรัฐธรรมนูญ',
    '2025-12-31': 'วันสิ้นปี',
};

const SHIFTS = {
    'morning': { id: 'morning', label: 'กะเช้า', time: '08:00 - 17:00', bg: 'bg-yellow-200', text: 'text-yellow-800', icon: <Sun className="w-4 h-4 mr-1" /> },
    'late': { id: 'late', label: 'กะสาย', time: '10:00 - 19:00', bg: 'bg-purple-200', text: 'text-purple-800', icon: <Moon className="w-4 h-4 mr-1" /> },
    'solo': { id: 'solo', label: 'กะพิเศษ', time: '09:00 - 18:00', bg: 'bg-green-200', text: 'text-green-800', icon: <UserCheck className="w-4 h-4 mr-1" /> },
    'leave': { id: 'leave', label: 'ลาหยุด', bg: 'bg-gray-200', text: 'text-gray-700', icon: <Coffee className="w-4 h-4 mr-1" /> }
};

const THEMES = {
    shinchan: { bg: 'bg-[#FFF5BA]', primary: 'bg-[#FF69B4]', secondary: 'bg-[#46C2CB]', text: 'text-gray-800', accent: 'bg-[#F9A826]', font: 'font-sans' },
    pastel: { bg: 'bg-slate-100', primary: 'bg-blue-400', secondary: 'bg-teal-300', text: 'text-gray-700', accent: 'bg-pink-400', font: 'font-sans' }
};

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(new Date()); // Start with the current date
    const [employees, setEmployees] = useState([]);
    const [schedules, setSchedules] = useState({});
    const [theme, setTheme] = useState('shinchan');
    const [dataLoading, setDataLoading] = useState(true);

    // Effect for handling authentication state
    useEffect(() => {
        if (!auth) {
            setAuthLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setAuthLoading(false);
            if (user) {
                setShowLogin(false); // Close login modal if user signs in
            }
        });
        return () => unsubscribe();
    }, []);

    // Effect for fetching data from Firestore
    useEffect(() => {
        if (!db) {
            setDataLoading(false);
            return;
        }
        setDataLoading(true);
        // Fetch employees
        const unsubEmployees = onSnapshot(collection(db, "employees"), (snapshot) => {
            const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEmployees(emps);
        }, (error) => {
            console.error("Error fetching employees:", error);
        });

        // Fetch schedules
        const unsubSchedules = onSnapshot(collection(db, "schedules"), (snapshot) => {
            const scheds = {};
            snapshot.forEach(doc => {
                scheds[doc.id] = doc.data();
            });
            setSchedules(scheds);
            setDataLoading(false); // Set loading to false after schedules are loaded
        }, (error) => {
            console.error("Error fetching schedules:", error);
            setDataLoading(false);
        });

        return () => {
            unsubEmployees();
            unsubSchedules();
        };
    }, []);

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            alert("เกิดข้อผิดพลาดในการออกจากระบบ");
        }
    };
    
    // This logic automatically adjusts shifts to 'solo' if only one person is working.
    const processedSchedules = useMemo(() => {
        const newSchedules = JSON.parse(JSON.stringify(schedules));
        Object.keys(newSchedules).forEach(dateStr => {
            const daySchedule = newSchedules[dateStr];
            const workingEmployees = Object.keys(daySchedule).filter(empId => daySchedule[empId] && daySchedule[empId] !== 'leave');
            
            if (workingEmployees.length === 1) {
                const soloWorkerId = workingEmployees[0];
                if(daySchedule[soloWorkerId] === 'morning' || daySchedule[soloWorkerId] === 'late') {
                    daySchedule[soloWorkerId] = 'solo';
                }
            }
        });
        return newSchedules;
    }, [schedules]);

    const currentTheme = THEMES[theme];

    if (!app) {
        return (
             <div className="min-h-screen bg-red-100 flex flex-col justify-center items-center p-4 text-red-800">
                <ShieldAlert className="w-16 h-16 mb-4" />
                <h1 className="text-2xl font-bold mb-2">การเชื่อมต่อ Firebase ผิดพลาด</h1>
                <p className="text-center">ไม่สามารถเริ่มต้น Firebase ได้<br/>กรุณาตรวจสอบ `firebaseConfig` ในโค้ดของคุณ</p>
            </div>
        )
    }

    if (authLoading) {
        return (
            <div className={`min-h-screen ${currentTheme.bg} flex justify-center items-center`}>
                <Loader2 className="w-16 h-16 animate-spin text-pink-500" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} ${currentTheme.font} p-2 sm:p-4 transition-colors duration-500`}>
            <Header 
                user={user} 
                onLoginClick={() => setShowLogin(true)} 
                onLogoutClick={handleLogout}
                currentTheme={currentTheme} 
            />
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            
            {user ? (
                <AdminDashboard 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    employees={employees} 
                    schedules={schedules} 
                    processedSchedules={processedSchedules}
                    currentTheme={currentTheme}
                />
            ) : (
                <PublicCalendar 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    employees={employees} 
                    schedules={processedSchedules} 
                    currentTheme={currentTheme}
                    dataLoading={dataLoading}
                />
            )}

            {showLogin && <LoginScreen onClose={() => setShowLogin(false)} currentTheme={currentTheme}/>}
            
            <Footer currentTheme={currentTheme}/>
        </div>
    );
}

// --- Components ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, currentTheme }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
                <ShieldAlert className={`w-16 h-16 mx-auto mb-4 ${currentTheme.accent.replace('bg-', 'text-')}`} />
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors">ยกเลิก</button>
                    <button onClick={onConfirm} className={`py-2 px-6 ${currentTheme.primary} text-white font-bold rounded-lg hover:opacity-90 transition-opacity`}>ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};

const Header = ({ user, onLoginClick, onLogoutClick, currentTheme }) => (
    <header className={`p-4 rounded-xl shadow-lg mb-4 flex justify-between items-center ${currentTheme.secondary} print-hide`}>
        <div className="flex items-center">
            <img src="https://placehold.co/50x50/ffffff/000000?text=S" alt="Logo" className="rounded-full mr-3 border-2 border-white"/>
            <h1 className="text-xl sm:text-3xl font-bold text-white">ตารางงานประจำเดือน</h1>
        </div>
        <div>
            {user ? (
                <button onClick={onLogoutClick} className={`flex items-center gap-2 ${currentTheme.accent} text-white font-bold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105`}><LogOut size={20}/> ออกจากระบบ</button>
            ) : (
                <button onClick={onLoginClick} className={`flex items-center gap-2 ${currentTheme.primary} text-white font-bold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105`}><LogIn size={20}/> แอดมิน</button>
            )}
        </div>
    </header>
);

const ThemeSwitcher = ({ theme, setTheme }) => (
    <div className="fixed top-20 right-4 z-50 bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-lg print-hide">
        <button onClick={() => setTheme(theme === 'shinchan' ? 'pastel' : 'shinchan')} className="flex items-center gap-2 text-gray-700 hover:text-pink-500 transition-colors">
            <Palette size={20} /> <span className="hidden sm:inline">เปลี่ยนธีม</span>
        </button>
    </div>
);

const PublicCalendar = ({ currentDate, setCurrentDate, employees, schedules, currentTheme, dataLoading }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const changeMonth = (offset) => setCurrentDate(new Date(year, month + offset, 1));

    return (
        <div id="printable-area" className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg relative">
            {dataLoading && !employees.length && (
                <div className="absolute inset-0 bg-white/50 flex justify-center items-center z-10 rounded-2xl">
                    <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
                </div>
            )}
            <CalendarHeader currentDate={currentDate} changeMonth={changeMonth} currentTheme={currentTheme} />
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-bold text-gray-600 my-2">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="border rounded-lg bg-gray-50"></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const holidayName = publicHolidays[dateStr];
                    const daySchedule = schedules[dateStr];

                    return (
                        <div key={day} className={`p-1 sm:p-2 border rounded-lg min-h-[100px] sm:min-h-[140px] flex flex-col transition-all duration-300 ${isWeekend && !holidayName ? 'bg-gray-100' : 'bg-white'} ${holidayName ? 'bg-red-100' : ''}`}>
                            <div className={`font-bold ${isWeekend || holidayName ? 'text-red-500' : ''}`}>{day}</div>
                            {holidayName && <div className="text-xs sm:text-sm font-semibold text-red-700 mt-1 flex items-center"><PartyPopper size={14} className="mr-1"/>{holidayName}</div>}
                            {daySchedule && (
                                <div className="mt-1 space-y-1 text-xs sm:text-sm">
                                    {employees.map(emp => {
                                        const shiftId = daySchedule[emp.id];
                                        if (!shiftId) return null;
                                        const shiftInfo = SHIFTS[shiftId];
                                        if (!shiftInfo) return null; 
                                        return (
                                            <div key={emp.id} className={`p-1 rounded ${shiftInfo.bg} ${shiftInfo.text}`}>
                                                <div className="flex items-center font-semibold">
                                                    {shiftInfo.icon}
                                                    <span>{emp.name}: {shiftInfo.label}</span>
                                                </div>
                                                {shiftInfo.time && (
                                                    <div className="text-xs pl-5 opacity-90">{shiftInfo.time}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <Legend />
        </div>
    );
};

const CalendarHeader = ({ currentDate, changeMonth, currentTheme }) => (
    <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className={`p-2 rounded-full ${currentTheme.accent} text-white shadow-md hover:opacity-80 print-hide`}><ChevronLeft /></button>
        <h2 className="text-xl sm:text-2xl font-bold text-center">{getThaiMonthName(currentDate.getMonth())} {currentDate.getFullYear() + 543}</h2>
        <div className="flex items-center gap-2">
           <button onClick={() => window.print()} className="p-2 rounded-full bg-gray-200 text-gray-700 shadow-md hover:bg-gray-300 print-hide"><Printer /></button>
           <button onClick={() => changeMonth(1)} className={`p-2 rounded-full ${currentTheme.accent} text-white shadow-md hover:opacity-80 print-hide`}><ChevronRight /></button>
        </div>
    </div>
);

const Legend = () => (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2 text-center">คำอธิบายสัญลักษณ์</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs sm:text-sm">
            {Object.values(SHIFTS).map(shift => (
                <div key={shift.id} className={`flex items-center p-2 rounded-md ${shift.bg} ${shift.text}`}>
                    {shift.icon}
                    <div><span className="font-bold">{shift.label}</span>{shift.time && <span className="block">{shift.time}</span>}</div>
                </div>
            ))}
            <div className="flex items-center p-2 rounded-md bg-red-100 text-red-700">
                <PartyPopper className="w-4 h-4 mr-1" />
                <div><span className="font-bold">วันหยุดนักขัตฤกษ์</span></div>
            </div>
        </div>
    </div>
);

const LoginScreen = ({ onClose, currentTheme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (!auth) {
            setError("Authentication service is not available.");
            setLoading(false);
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener in App.js will handle closing the modal
        } catch (err) {
            console.error("Firebase Login Error: ", err.code);
            // This error code is generic to prevent account enumeration attacks
            if (err.code === 'auth/invalid-credential') {
                 setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
            } else {
                setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-40 p-4" onClick={onClose}>
            <div className="w-full max-w-sm p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">เข้าสู่ระบบแอดมิน</h2>
                <img src="https://placehold.co/100x100/46C2CB/FFFFFF?text=Admin" alt="Admin Lock" className="mx-auto mb-4 rounded-full border-4 border-white shadow-lg"/>
                <form onSubmit={handleSubmit}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" required className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg text-center focus:outline-none focus:border-pink-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" required className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg text-center focus:outline-none focus:border-pink-400" />
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                    <button type="submit" disabled={loading} className={`w-full ${currentTheme.primary} text-white font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105 flex justify-center items-center disabled:opacity-50`}>
                        {loading ? <Loader2 className="animate-spin" /> : 'เข้าสู่ระบบ'}
                    </button>
                    <button type="button" onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-800">ยกเลิก</button>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard = ({ currentDate, setCurrentDate, employees, schedules, processedSchedules, currentTheme }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalSchedule, setModalSchedule] = useState({});

    const handleDayClick = (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        setSelectedDate(date);
        setModalSchedule(schedules[dateStr] || {});
    };

    const handleSaveSchedule = async () => {
        if (!selectedDate || !db) return;
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        
        const scheduleRef = doc(db, "schedules", dateStr);
        
        const newDaySchedule = {};
        let hasAssignments = false;
        employees.forEach(emp => {
            if (modalSchedule[emp.id]) {
                newDaySchedule[emp.id] = modalSchedule[emp.id];
                hasAssignments = true;
            }
        });

        try {
            if (hasAssignments) {
                await setDoc(scheduleRef, newDaySchedule);
            } else {
                // If no one is scheduled, delete the document for that day
                await deleteDoc(scheduleRef);
            }
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกตารางงาน");
        } finally {
            setSelectedDate(null);
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg">
                <AdminCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} schedules={processedSchedules} onDayClick={handleDayClick} currentTheme={currentTheme} />
            </div>
            <div className="space-y-6">
                <EmployeeManager employees={employees} currentTheme={currentTheme}/>
            </div>
            {selectedDate && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">จัดการตารางงานวันที่ {selectedDate.toLocaleDateString('th-TH')}</h3>
                        <div className="space-y-4">
                            {employees.map(emp => (
                                <div key={emp.id} className="flex items-center justify-between">
                                    <span className="font-semibold">{emp.name}</span>
                                    <select 
                                        value={modalSchedule[emp.id] || ''}
                                        onChange={(e) => setModalSchedule({...modalSchedule, [emp.id]: e.target.value})}
                                        className="p-2 border rounded-lg bg-white"
                                    >
                                        <option value="">-- ว่าง --</option>
                                        <option value="morning">กะเช้า</option>
                                        <option value="late">กะสาย</option>
                                        <option value="solo">กะพิเศษ</option>
                                        <option value="leave">ลาหยุด</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-2">
                            <Info size={20} className="flex-shrink-0 mt-0.5"/>
                            <span><b>หมายเหตุ:</b> หากมีพนักงานทำงานคนเดียว กะจะถูกเปลี่ยนเป็น <b>กะพิเศษ</b> โดยอัตโนมัติในหน้าแสดงผล</span>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setSelectedDate(null)} className="flex items-center gap-2 bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400"><XCircle size={20}/>ยกเลิก</button>
                            <button onClick={handleSaveSchedule} className={`flex items-center gap-2 ${currentTheme.primary} text-white font-bold py-2 px-4 rounded-lg hover:opacity-90`}><Save size={20}/>บันทึก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminCalendar = ({ currentDate, setCurrentDate, schedules, onDayClick, currentTheme }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const changeMonth = (offset) => setCurrentDate(new Date(year, month + offset, 1));

    return (
        <div>
            <CalendarHeader currentDate={currentDate} changeMonth={changeMonth} currentTheme={currentTheme} />
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-bold text-gray-600 my-2">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-admin-${i}`} className="border rounded-lg bg-gray-50"></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const holidayName = publicHolidays[dateStr];
                    const daySchedule = schedules[dateStr];
                    const isHoliday = !!holidayName;

                    return (
                        <div 
                            key={day} 
                            onClick={() => onDayClick(date)}
                            className={`p-1 sm:p-2 border rounded-lg min-h-[90px] sm:min-h-[120px] flex flex-col transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-pink-400 hover:scale-105 ${isHoliday ? 'bg-red-100' : (isWeekend ? 'bg-gray-100' : 'bg-white')}`}
                        >
                            <div className={`font-bold ${isWeekend || isHoliday ? 'text-red-500' : ''}`}>{day}</div>
                             {holidayName && <div className="text-xs font-semibold text-red-700 mt-1"><PartyPopper size={14} className="inline mr-1"/>{holidayName}</div>}
                            {daySchedule && (
                                <div className="mt-1 space-y-1 text-xs">
                                    {Object.keys(daySchedule).map(empId => {
                                        const shiftId = daySchedule[empId];
                                        if (!shiftId) return null;
                                        const shiftInfo = SHIFTS[shiftId];
                                        if (!shiftInfo) return null;
                                        return (<div key={empId} className={`p-1 rounded ${shiftInfo.bg} ${shiftInfo.text}`}>{shiftInfo.label}</div>);
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EmployeeManager = ({ employees, currentTheme }) => {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    
    // State for confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    const addEmployee = async () => { 
        if (newName.trim() && db) { 
            try {
                // Use addDoc to let Firestore generate an ID
                await addDoc(collection(db, "employees"), { name: newName.trim() });
                setNewName('');
            } catch (error) {
                console.error("Error adding employee:", error);
                alert("เกิดข้อผิดพลาดในการเพิ่มพนักงาน");
            }
        } 
    };
    
    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setIsModalOpen(true);
    };

    const confirmDeleteEmployee = async () => {
        if (employeeToDelete && db) {
            try {
                await deleteDoc(doc(db, "employees", employeeToDelete.id));
                // Note: This does not delete the employee's schedules.
                // For a full implementation, you might need a Firebase Function
                // to clean up schedules associated with the deleted employee.
            } catch (error) {
                console.error("Error deleting employee: ", error);
                alert("เกิดข้อผิดพลาดในการลบพนักงาน");
            } finally {
                setIsModalOpen(false);
                setEmployeeToDelete(null);
            }
        }
    };

    const startEditing = (employee) => { 
        setEditingId(employee.id); 
        setEditingName(employee.name); 
    };
    
    const saveEdit = async () => { 
        if (editingId && editingName.trim() && db) {
            try {
                const empRef = doc(db, "employees", editingId);
                await updateDoc(empRef, { name: editingName.trim() });
            } catch (error) {
                console.error("Error updating employee: ", error);
                alert("เกิดข้อผิดพลาดในการแก้ไขชื่อพนักงาน");
            } finally {
                setEditingId(null); 
                setEditingName('');
            }
        }
    };

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteEmployee}
                title="ยืนยันการลบ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน "${employeeToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                currentTheme={currentTheme}
            />
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold mb-3 flex items-center"><Users className="mr-2" />จัดการพนักงาน</h3>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                    {employees.map(emp => (
                        <div key={emp.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            {editingId === emp.id ? ( 
                                <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className="p-1 border rounded-md w-full bg-white"/> 
                            ) : ( 
                                <span>{emp.name}</span> 
                            )}
                            <div className="flex gap-2">
                                 {editingId === emp.id ? (
                                    <><button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Save size={18}/></button><button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700"><XCircle size={18}/></button></>
                                ) : (
                                    <><button onClick={() => startEditing(emp)} className="text-blue-600 hover:text-blue-800"><Edit size={18}/></button><button onClick={() => handleDeleteClick(emp)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button></>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="ชื่อพนักงานใหม่" 
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400" 
                        onKeyPress={(e) => e.key === 'Enter' && addEmployee()}
                    />
                    <button onClick={addEmployee} className={`p-2 rounded-lg ${currentTheme.secondary} text-white shadow-md hover:opacity-90`}><UserPlus /></button>
                </div>
            </div>
        </>
    );
};

const Footer = ({ currentTheme }) => (
    <footer className={`text-center mt-6 text-sm ${currentTheme.text} opacity-70 print-hide`}>
        <p>สร้างสรรค์โดย Gemini ด้วยความรัก 💖</p>
        <p>ธีมได้รับแรงบันดาลใจจาก Crayon Shin-chan</p>
    </footer>
);
