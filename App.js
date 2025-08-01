import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, UserPlus, LogIn, LogOut, Users, Trash2, Edit, Save, XCircle, Sun, Moon, UserCheck, Coffee, PartyPopper, Palette, Info, Printer } from 'lucide-react';

// Helper Functions
const getThaiMonthName = (monthIndex) => {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return months[monthIndex];
};

// วันหยุดนักขัตฤกษ์ (ข้อมูลคงที่)
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

// Mock Data
const initialEmployees = [ { id: 'emp1', name: 'PK' }, { id: 'emp2', name: 'OC' } ];
const initialSchedules = {
    '2025-08-04': { emp1: 'morning', emp2: 'late' },
    '2025-08-05': { emp1: 'leave', emp2: 'late' },
    '2025-08-06': { emp1: 'morning', emp2: 'leave' },
    '2025-08-11': { emp1: 'morning', emp2: 'late' },
    '2025-08-12': { emp1: 'solo' },
    '2025-08-18': { emp1: 'late', emp2: 'morning' },
};

// Main App Component
export default function App() {
    const [view, setView] = useState('public');
    const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1));
    const [employees, setEmployees] = useState(initialEmployees);
    const [schedules, setSchedules] = useState(initialSchedules);
    const [theme, setTheme] = useState('shinchan');

    const handleLogin = (password) => {
        if (password === 'admin1234') { setView('admin'); } 
        else { alert('รหัสผ่านไม่ถูกต้อง!'); }
    };
    
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

    return (
        <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} ${currentTheme.font} p-2 sm:p-4 transition-colors duration-500`}>
            <Header view={view} setView={setView} currentTheme={currentTheme} />
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            
            {view === 'public' && <PublicCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} employees={employees} schedules={processedSchedules} currentTheme={currentTheme}/>}
            {view === 'login' && <LoginScreen onLogin={handleLogin} setView={setView} currentTheme={currentTheme}/>}
            {view === 'admin' && <AdminDashboard 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
                employees={employees} 
                setEmployees={setEmployees}
                schedules={schedules} 
                processedSchedules={processedSchedules}
                setSchedules={setSchedules}
                currentTheme={currentTheme}
            />}
            <Footer currentTheme={currentTheme}/>
        </div>
    );
}

// Components
const Header = ({ view, setView, currentTheme }) => (
    <header className={`p-4 rounded-xl shadow-lg mb-4 flex justify-between items-center ${currentTheme.secondary} print-hide`}>
        <div className="flex items-center">
            <img src="https://placehold.co/50x50/ffffff/000000?text=S" alt="Logo" className="rounded-full mr-3 border-2 border-white"/>
            <h1 className="text-xl sm:text-3xl font-bold text-white">ตารางงานประจำเดือน</h1>
        </div>
        <div>
            {view === 'public' && <button onClick={() => setView('login')} className={`flex items-center gap-2 ${currentTheme.primary} text-white font-bold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105`}><LogIn size={20}/> แอดมิน</button>}
            {view === 'admin' && <button onClick={() => setView('public')} className={`flex items-center gap-2 ${currentTheme.accent} text-white font-bold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105`}><LogOut size={20}/> ออกจากระบบ</button>}
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

const PublicCalendar = ({ currentDate, setCurrentDate, employees, schedules, currentTheme }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const changeMonth = (offset) => setCurrentDate(new Date(year, month + offset, 1));

    return (
        <div id="printable-area" className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg">
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

const LoginScreen = ({ onLogin, setView, currentTheme }) => {
    const [password, setPassword] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onLogin(password); };
    return (
        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl text-center">
                <h2 className="text-2xl font-bold mb-6">เข้าสู่ระบบแอดมิน</h2>
                <img src="https://placehold.co/100x100/46C2CB/FFFFFF?text=Admin" alt="Admin Lock" className="mx-auto mb-4 rounded-full border-4 border-white shadow-lg"/>
                <form onSubmit={handleSubmit}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน (admin1234)" className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg text-center focus:outline-none focus:border-pink-400" />
                    <button type="submit" className={`w-full ${currentTheme.primary} text-white font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105`}>เข้าสู่ระบบ</button>
                    <button type="button" onClick={() => setView('public')} className="mt-4 text-gray-500 hover:text-gray-800">กลับไปหน้าหลัก</button>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard = ({ currentDate, setCurrentDate, employees, setEmployees, schedules, processedSchedules, setSchedules, currentTheme }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalSchedule, setModalSchedule] = useState({});

    const handleDayClick = (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        setSelectedDate(date);
        setModalSchedule(schedules[dateStr] || {});
    };

    const handleSaveSchedule = () => {
        if (!selectedDate) return;
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const newSchedules = {...schedules};
        
        const currentDaySchedule = {};
        let hasChanges = false;
        employees.forEach(emp => {
            if (modalSchedule[emp.id]) {
                currentDaySchedule[emp.id] = modalSchedule[emp.id];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            newSchedules[dateStr] = currentDaySchedule;
        } else {
            delete newSchedules[dateStr];
        }
        
        setSchedules(newSchedules);
        setSelectedDate(null);
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg">
                <AdminCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} schedules={processedSchedules} onDayClick={handleDayClick} currentTheme={currentTheme} />
            </div>
            <div className="space-y-6">
                <EmployeeManager employees={employees} setEmployees={setEmployees} currentTheme={currentTheme}/>
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
                                        className="p-2 border rounded-lg"
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
                            <span><b>หมายเหตุ:</b> หากมีพนักงานลาหยุด 1 คน กะของอีกคนจะถูกเปลี่ยนเป็น <b>กะพิเศษ</b> โดยอัตโนมัติ</span>
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

const EmployeeManager = ({ employees, setEmployees, currentTheme }) => {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const addEmployee = () => { if (newName.trim()) { setEmployees([...employees, { id: `emp${Date.now()}`, name: newName.trim() }]); setNewName(''); } };
    const deleteEmployee = (id) => { if (window.confirm('คุณแน่ใจหรือไม่ว่าจะลบพนักงานคนนี้?')) { setEmployees(employees.filter(emp => emp.id !== id)); } };
    const startEditing = (employee) => { setEditingId(employee.id); setEditingName(employee.name); };
    const saveEdit = () => { setEmployees(employees.map(emp => emp.id === editingId ? { ...emp, name: editingName } : emp)); setEditingId(null); setEditingName(''); };

    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-3 flex items-center"><Users className="mr-2" />จัดการพนักงาน</h3>
            <div className="space-y-2 mb-4">
                {employees.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        {editingId === emp.id ? ( <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className="p-1 border rounded-md w-full"/> ) : ( <span>{emp.name}</span> )}
                        <div className="flex gap-2">
                             {editingId === emp.id ? (
                                <><button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Save size={18}/></button><button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700"><XCircle size={18}/></button></>
                            ) : (
                                <><button onClick={() => startEditing(emp)} className="text-blue-600 hover:text-blue-800"><Edit size={18}/></button><button onClick={() => deleteEmployee(emp.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button></>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ชื่อพนักงานใหม่" className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400" />
                <button onClick={addEmployee} className={`p-2 rounded-lg ${currentTheme.secondary} text-white shadow-md hover:opacity-90`}><UserPlus /></button>
            </div>
        </div>
    );
};

const Footer = ({ currentTheme }) => (
    <footer className={`text-center mt-6 text-sm ${currentTheme.text} opacity-70 print-hide`}>
        <p>สร้างสรรค์โดย Gemini ด้วยความรัก 💖</p>
        <p>ธีมได้รับแรงบันดาลใจจาก Crayon Shin-chan</p>
    </footer>
);
