-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 20, 2026 at 08:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;
--
-- Database: `ccc_smartassist`
--
-- --------------------------------------------------------
--
-- Table structure for table `chat_sessions`
--
CREATE TABLE `chat_sessions` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT 'New Inquiry',
  `user_id` varchar(50) DEFAULT NULL,
  `last_updated` bigint(20) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `chat_sessions`
--
INSERT INTO `chat_sessions` (`id`, `title`, `user_id`, `last_updated`)
VALUES (
    '0g4g0r3zi4k',
    'How do I enroll?',
    'guest',
    1770987566
  ),
  (
    '12gp0dmcck1g',
    'How do I enroll?',
    'guest',
    1770989468
  ),
  (
    '1jwrw3bpghp',
    'Salamat ta igwa akong ikaw sa buhay ko.',
    'student-698f1a8bc9fc0',
    1770989657
  ),
  (
    '3cblj6el0fu',
    'Guest Inquiry',
    'guest',
    1770890160090
  ),
  (
    '3f22ri4h84e',
    'what is the Lampara?',
    'student-01',
    1770890364893
  ),
  (
    'ax5i8byb0lh',
    'New Inquiry',
    'student-698f1a8bc9fc0',
    1771048509616
  ),
  (
    'juz9rv5ospb',
    'New Inquiry',
    'student-698f18029f62d',
    1770985604808
  ),
  ('k4o1mhcbqja', 'hi', 'guest', 1770892682),
  (
    'tfwel5t3t9j',
    'Salamat ta igwa akong ikaw sa buhay ko.',
    'student-698f1a8bc9fc0',
    1770989697
  ),
  (
    'vcwctr9tyf',
    'Hi Kumusta po Magandang Tnaghali po at Happy Valen',
    'student-698f1a8bc9fc0',
    1770986204
  ),
  (
    'y7lucfuzsuh',
    'HI',
    'student-698daf35e7c3e',
    1771572780917
  );
-- --------------------------------------------------------
--
-- Table structure for table `faq_questions`
--
CREATE TABLE `faq_questions` (
  `id` varchar(50) NOT NULL,
  `question` text NOT NULL,
  `date_added` bigint(20) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'general'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `faq_questions`
--
INSERT INTO `faq_questions` (`id`, `question`, `date_added`, `category`)
VALUES (
    '69980b37296b8',
    'How to enroll?',
    1771572023,
    'general'
  );
-- --------------------------------------------------------
--
-- Table structure for table `knowledge_base`
--
CREATE TABLE `knowledge_base` (
  `id` varchar(50) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(50) DEFAULT 'general',
  `source` varchar(50) DEFAULT 'manual',
  `date_added` bigint(20) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `knowledge_base`
--
INSERT INTO `knowledge_base` (
    `id`,
    `question`,
    `answer`,
    `category`,
    `source`,
    `date_added`
  )
VALUES (
    'o875vpk8tu',
    'Document: CCC (chatbot).pdf',
    '[Page 1]\nCainta Catholic College (CCC) is a multi-level educational institution located in Cainta, Rizal,  Philippines, under the Diocese of Antipolo. It provides Catholic-centered education from  preschool up to tertiary (college and graduate) levels.  History and Identity  ●   Founding: The school traces its origins back to 1931, established through the  missionary zeal of the CICM (Congregation of the Immaculate Heart of Mary) by Rev. Fr.  Jose Tajon, the then-parish priest of Our Lady of Light Parish.  ●   Mission: CCC is committed to providing excellent, Christ-centered education, serving  the middle and lower socio-economic strata of its parish and nearby areas.  ●   Accreditation: The institution has achieved Level 2 accreditation status from the  Philippine Association of Colleges and Universities Commission on Accreditation  (PACUCOA) for some of its programs, a ffi rming its commitment to quality.  Academic Programs  Cainta Catholic College offers education across multiple levels:  Basic Education  ●   Preschool: Nursery and Kinder  ●   Grade School: Grade 1 to Grade 6  ●   Junior High School: Grade 7 to Grade 10  ●   Senior High School (SHS): Offers various academic and technical-vocational  tracks/strands:  ○   Academic Tracks:  ■   Accounting, Business and Management (ABM)  ■   Science, Technology, Engineering, and Mathematics (STEM)  ■   Humanities and Social Sciences (HUMSS)  ■   General Academic Strand (GAS)  ○   Technical-Vocational Tracks:  ■   Information-Communication Technology (ICT) (Computer System  Servicing, Animation)  ■   Technological and Livelihood Education (TLE) (Bread and Pastry  Production NC II, Food and Beverages Services NC II, Tailoring NC II)  College Programs  The college department offers various Bachelor\'s degree programs, including:  ●   Education: Only   ₱235   per unit plus Miscellaneous Fees  ○   Bachelor of Arts in Religious Education (ABREED)  ○   Bachelor of Secondary Education (BSED) (Major in English, Mathematics, and  Science)\n\n[Page 2]\n○   Bachelor of Elementary Education (BEED)  ●   Business/Management: Only   ₱235   per unit plus Miscellaneous Fees  ○   Bachelor of Science in Business Administration (BSBA)  ○   Bachelor of Science in O ffi ce Administration (BSOA)  ●   Technology: Only   ₱235   per unit plus Miscellaneous Fees  ○   Bachelor of Science in Computer Science (BSCS)  ●   Law: Only at   ₱1,500   per unit plus Miscellaneous Fees  ○   Juris Doctor Program (School of Law)  Contact and Location  ●   Location: A. Bonifacio Ave., Poblacion, Cainta, Rizal, Philippines, 1900.  ●   Trunkline: +632 (08) 643 2000  ●   Email: ccc@caintacatholiccollege.edu.ph  ●   O ffi cial Website:   https://www.caintacatholiccollege.edu.ph/  ●   Administration O ffi ce – (8) 655 4078  ●   Finance O ffi ce – (8) 655 6127  ●   Human Resource Mngt. Dept. – (8) 655 2965  ●   Registrar’s O ffi ce – (8) 643 2000  Distinctive Features  ●   Evangelization and Spiritual Formation: A core part of the school\'s mission is to mold  the religious and spiritual formation of its students.  ●   Technology Access: The school provides global access to the information  superhighway through Internet and Wi-Fi access.  ●   Diocesan College: It is recognized as the Diocesan College of the Diocese of Antipolo.  CCC Hymn  Alma Mater dear all hail to thee  We will sing your praise and glory  You have led and made us fight for right  Through your portals our future smiles so bright.\n\n[Page 3]\nWe will praise thy name O CCC  We will ever stand on defense for it  We will sing thy praise dear CCC  Through our deed we’ll prove we are brave and fit.  We fear not tomorrow  We shall not fear the rain  And though we be met with sorrow  We shall sing on and not feel the pain  And when our paths should separate  We’ll have a heart for any fate  We’ll have sweet memories that cannot die  After we utter that jeweled word goodbye.  Had God keep watch ‘tween thee and us  And keep us ever near to Him  Alma Mater dear all hail to thee  We will sing your praise and glory.  Ever upward and onward we will strive  Loyalty and truth in our hearts will thrive  God blesses thee … He blesses us  Alma Mater!  Admission Requirements  1.   Freshmen/First Year  ●   Two (2) Recent 2×2 Colored ID Pictures\n\n[Page 4]\n●   Original Report Card (Form 138) with at least 80% general average – Original and Photocopy  ●   PSA Birth Certificate – Original and Photocopy  ●   Baptismal Certificate – Original and Photocopy  ●   Certification of Good Moral Character from an authorized school official  ●   Interview (Guidance/Dean or Program Chairperson)  ●   Government Examination (PEPT, NCAE, ALS, etc.)  ●   Medical/Health Certificate for drug-free condition and from other forms of illnesses  ●   If married, Marriage Certificate issued by the Catholic Church  ●   Shall meet the specific requirements for the designated course applied for.  2.   Transferees  ●   As a general rule, only students without failure, incomplete marks and dropped subjects may be admitted for academic promotion.  ●   Must apply within the prescribed period set by the school.  ●   Must present the following credentials: Certificate of Transfer, Good Moral Character, Transcript of Records or Certificate of Grades for evaluation purposes, PSA Birth Certificate (Original and Photocopy), Baptismal Certificate (Original and Photocopy), and two (2) recent colored ID pictures.  ●   Must pass the interviews and entrance examination given by the College.  ●   Subject for evaluation/assessment.  3.   Old Students  ●   As a general rule, continuing students must have passed at least 60% of the total number of units taken in the previous semester including P.E. and NSTP-CWTS.\n\n[Page 5]\n●   For students seeking readmission after stopping for a semester or more:  1.   Must have not enrolled in another school  2.   Must secure clearance from the Office of Student Affairs (Students found to have serious offenses may be denied re-admission)  3.   Must secure clearance from the Finance Office  ●   Proceed to the Registrar’s Office for assessment/evaluation  4.   Degree Holders/Unit Earners  ●   Official Transcript of Records with Special Order from CHED  ●   Two (2) recent 2×2 Colored ID Pictures  ●   PSA Birth Certificate – Original and Photocopy  ●   Baptismal Certificate – Original and Photocopy  Late Enrollees  1.   The Registrar attends to the request of the students in case of late enrollment  2.   The student presents a letter requesting approval to enroll. To be embodied in the request are the following: justification of the request, subjects to be taken and their corresponding units, schedule of classes, and semestral load as per College’s approved curriculum.  Administration  ○   Management Committee  ●   College President - Rev. Fr. Glenn William Z. Relucio, Ph.D  ●   Academic Steward - Dr. Nenita Q. Viloria  ●   Administrative Steward - Ms. Jane Kathleen R. Palma, MA  ●   CCF Head - Sr. Rocelie M. Millorada, SSA  ●   College Dean - Dr. Lerma S. Fernandez\n\n[Page 6]\n●   Dean of School in Law - Atty. Voltaire Duano  LAMPARA SMS LINK  ●   LAMPARA SMS',
    'general',
    'pdf',
    1770889618070
  );
-- --------------------------------------------------------
--
-- Table structure for table `manual_rules`
--
CREATE TABLE `manual_rules` (
  `id` varchar(50) NOT NULL,
  `keyword` text NOT NULL,
  `response` text NOT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `messages`
--
CREATE TABLE `messages` (
  `id` varchar(50) NOT NULL,
  `session_id` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `feedback` tinyint(4) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `messages`
--
INSERT INTO `messages` (
    `id`,
    `session_id`,
    `role`,
    `content`,
    `timestamp`,
    `feedback`
  )
VALUES (
    '5q4hk85l735',
    '3cblj6el0fu',
    'user',
    'what is the Lampara?',
    1770890160083,
    NULL
  ),
  (
    '8if3ok7pwug',
    'ax5i8byb0lh',
    'user',
    'What programs do you offer?',
    1771048509015,
    NULL
  ),
  (
    '9rhheyhcqhf',
    '12gp0dmcck1g',
    'model',
    'To enroll, please visit the Registrar\'s Office to get your clearance and assessment form. You can also view the requirements on our official website or validitate your student status here.',
    1771048548648,
    NULL
  ),
  (
    'bvqscqqxrln',
    'ax5i8byb0lh',
    'model',
    'We offer Basic Education (K-12) and College programs including BS Information Technology, BS Business Administration, BE Education, and AB Psychology.',
    1771048509615,
    NULL
  ),
  (
    'b_698dacfe4957e',
    'k4o1mhcbqja',
    'model',
    'Hi there! 👋 Welcome to CCC SmartAssist! So happy to connect with you today. 😊\n\nHow can I help you get started on your journey with Cainta Catholic College? Whether you have questions about enrollment, programs, or just want to know more about our school, I\'m here to assist! 💙',
    1770892542,
    NULL
  ),
  (
    'b_698dad343f1f6',
    'k4o1mhcbqja',
    'model',
    'Oh, that\'s a great question! We have wonderful leaders here at CCC. 😊\n\nFor the **College Dean**, that would be **Dr. Lerma S. Fernandez**.\n\nAnd if you\'re curious about our legal eagles, the **Dean of the School of Law** is **Atty. Voltaire Duano**. ⚖️\n\nIs there a specific program or department you\'re interested in? Let me know! 🎓',
    1770892596,
    NULL
  ),
  (
    'b_698dad8aa53dc',
    'k4o1mhcbqja',
    'model',
    'Ah, good question! \"Lampara\" refers to our **LAMPARA SMS LINK**. 📱\n\nIt\'s our way of keeping communication smooth and easy, likely for important announcements or updates via SMS. Think of it as a direct line from the school to you! 😊\n\nIs there anything specific you\'d like to know about how it works or what kind of messages you might receive through it?',
    1770892682,
    NULL
  ),
  (
    'b_698f1adc1b975',
    'vcwctr9tyf',
    'model',
    'Hello po! 😊 Magandang tanghali rin po sa\'yo at **Happy Valentine\'s Day** din! ❤️ Sana masaya ang araw mo!\n\nKumusta ka? Mayroon ka bang kailangan ng tulong tungkol sa Cainta Catholic College? Nandito lang ako para sagutin ang mga tanong mo! 🎓',
    1770986204,
    NULL
  ),
  (
    'b_698f1f7dae18b',
    '0g4g0r3zi4k',
    'model',
    'Oh, you\'re asking about the requirements for freshmen! That\'s a great question, and I\'m happy to help you with that! 😊\n\nHere\'s what you\'ll need to prepare if you\'re enrolling as a **Freshman/First Year** student:\n\n1.  **Two (2) Recent 2x2 Colored ID Pictures** 📸\n2.  **Original Report Card (Form 138)** with at least **80% general average** (Original and Photocopy)\n3.  **PSA Birth Certificate** (Original and Photocopy)\n4.  **Baptismal Certificate** (Original and Photocopy)\n5.  **Certification of Good Moral Character** from an authorized school official\n6.  You\'ll also have an **Interview** with the Guidance Counselor, Dean, or Program Chairperson.\n7.  Any **Government Examination** results (like PEPT, NCAE, ALS, etc.)\n8.  A **Medical/Health Certificate** to ensure you\'re drug-free and in good health.\n9.  If you\'re married, a **Marriage Certificate** issued by the Catholic Church.\n10. And of course, you\'ll need to meet any **specific requirements for your chosen course**!\n\nI know it looks like a lot, but don\'t worry, we\'re here to guide you every step of the way! 💙 Just make sure to gather these documents, and you\'ll be well on your way to becoming a part of the CCC family!\n\nLet me know if you have any other questions! 😊',
    1770987389,
    NULL
  ),
  (
    'b_698f1ff0a44b1',
    '0g4g0r3zi4k',
    'model',
    'That\'s an excellent question! We have a fantastic range of college programs here at CCC, designed to help you achieve your dreams! 🎓\n\nHere are the Bachelor\'s degree programs we offer in our college department:\n\n### **Education Programs**\n*(Only ₱235 per unit plus Miscellaneous Fees)*\n*   **Bachelor of Arts in Religious Education (ABREED)**\n*   **Bachelor of Secondary Education (BSED)**\n    *   Major in English\n    *   Major in Mathematics\n    *   Major in Science\n*   **Bachelor of Elementary Education (BEED)**\n\n### **Business/Management Programs**\n*(Only ₱235 per unit plus Miscellaneous Fees)*\n*   **Bachelor of Science in Business Administration (BSBA)**\n*   **Bachelor of Science in Office Administration (BSOA)**\n\n### **Technology Programs**\n*(Only ₱235 per unit plus Miscellaneous Fees)*\n*   **Bachelor of Science in Computer Science (BSCS)**\n\n### **Law Program**\n*(Only ₱1,500 per unit plus Miscellaneous Fees)*\n*   **Juris Doctor Program (School of Law)**\n\nIt\'s great to see you\'re exploring your options! Do any of these catch your eye? Let me know if you\'d like to know more about a specific program! 😊',
    1770987504,
    NULL
  ),
  (
    'b_698f202ee0746',
    '0g4g0r3zi4k',
    'model',
    'You\'re very welcome! It was my pleasure helping you out! 😊\n\nThank you so much, and **Happy Valentine\'s Day** to you too! I hope you have a wonderful day filled with love and joy! 💖\n\nDon\'t hesitate to reach out if you have any more questions or need anything else for your enrollment journey. We\'re always here for you! Take care! 👋',
    1770987566,
    NULL
  ),
  (
    'b_698f2750d5c40',
    '12gp0dmcck1g',
    'model',
    'Naimbag a bigat din, friend! 😊 Sana maging mayat din ang aldaw mo! ☀️\n\nSalamat sa pagbati! Mayroon ka bang katanungan tungkol sa Cainta Catholic College today? Nandito ako para tumulong! 💙',
    1770989392,
    NULL
  ),
  (
    'b_698f279c8abab',
    '12gp0dmcck1g',
    'model',
    'Maayong adlaw pud sa imoha, friend! 😊 Salamat sa pagbati! Sana maging maganda rin ang araw mo! ☀️\n\nNandito ako para tulungan ka sa kahit anong katanungan mo about Cainta Catholic College. Mayroon ka bang gustong malaman tungkol sa school, enrollment, or programs namin? Let me know! 💙',
    1770989468,
    NULL
  ),
  (
    'b_698f28591557d',
    '1jwrw3bpghp',
    'model',
    'Aww, that\'s so sweet of you to say! 💖 Maraming salamat din sa\'yo! It really warms my heart to know I can be of help. 😊\n\nI\'m always here to support you with anything you need for your journey at Cainta Catholic College! What can I assist you with today? Don\'t hesitate to ask! 📚',
    1770989657,
    NULL
  ),
  (
    'b_698f286400110',
    'tfwel5t3t9j',
    'model',
    'Aww, salamat din sa\'yo! 🥰 Nakakatuwa naman \'yan! Masaya ako na nandito ako para sa\'yo.\n\nPara saan pa ba ako makakatulong today? May tanong ka ba about sa school, enrollment, or anything about Cainta Catholic College? I\'m all ears! 🎓💙',
    1770989668,
    NULL
  ),
  (
    'b_698f2881afbec',
    'tfwel5t3t9j',
    'model',
    'Ay, pasensya na! My apologies! 🙈 Sige, i-Bicol ko para mas maintindihan mo.\n\nAww, salamat man saimo! 🥰 Nakakapaugma man \'yan! Maugma ako na digdi ako para saimo.\n\nPara saen pa ako makakatabang ngunyan? Igwa ka daw nin hapot manungod sa eskwelahan, enrollment, o ano pa man manungod sa Cainta Catholic College? Handa akong magdangog! 🎓💙',
    1770989697,
    NULL
  ),
  (
    'b_6997344d0ed26',
    'y7lucfuzsuh',
    'model',
    'I\'m currently undergoing maintenance. Error: Gemini API Error (HTTP 404): models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.',
    1771517005,
    NULL
  ),
  (
    'b_69980dc3f14e1',
    'y7lucfuzsuh',
    'model',
    'Hiii there! 👋 So nice to hear from you! I\'m CCC SmartAssist, your friendly AI companion here at Cainta Catholic College! 💖\n\nHow can I help you today, future CCCian or fellow student? What\'s on your mind? ✨',
    1771572675,
    NULL
  ),
  (
    'b_69980e2c36ccb',
    'y7lucfuzsuh',
    'model',
    'Oh, exciting! You\'re asking about the requirements for freshmen! That\'s awesome! 🥳\n\nLet me see... for our incoming freshmen or first-year students, here\'s what you\'ll need to prepare:\n\n*   **Two (2) Recent 2x2 Colored ID Pictures** 📸\n*   **Original Report Card (Form 138)** with at least an 80% general average – make sure to bring both the original and a photocopy!\n*   **PSA Birth Certificate** – original and photocopy, please!\n*   **Baptismal Certificate** – yep, original and photocopy for this one too!\n*   **Certification of Good Moral Character** from an authorized school official.\n*   You\'ll also have an **Interview** with the Guidance/Dean or Program Chairperson.\n*   Any **Government Examination** results (like PEPT, NCAE, ALS, etc.).\n*   A **Medical/Health Certificate** confirming you\'re drug-free and free from other illnesses.\n*   If you\'re married, a **Marriage Certificate** issued by the Catholic Church.\n*   And of course, you\'ll need to meet any **specific requirements for the course** you\'re applying for!\n\nPhew! That might seem like a lot, but don\'t worry, it\'s all super manageable! Just gather them one by one. Let me know if you have any other questions! Good luck! 💙',
    1771572780,
    NULL
  ),
  (
    'h7x33rf50hi',
    '0g4g0r3zi4k',
    'user',
    'How do I enroll?',
    1771046551175,
    NULL
  ),
  (
    'i8pwvxd8ror',
    'juz9rv5ospb',
    'model',
    'We offer Basic Education (K-12) and College programs including BS Information Technology, BS Business Administration, BE Education, and AB Psychology.',
    1770985604807,
    NULL
  ),
  (
    'je4c1rn7mea',
    '0g4g0r3zi4k',
    'model',
    'To enroll, please visit the Registrar\'s Office to get your clearance and assessment form. You can also view the requirements on our official website or validitate your student status here.',
    1771046551776,
    NULL
  ),
  (
    'jt55iythjt',
    'ax5i8byb0lh',
    'user',
    'What scholarships are available?',
    1771048085238,
    NULL
  ),
  (
    'oeu3lv505i',
    'juz9rv5ospb',
    'user',
    'What programs do you offer?',
    1770985602975,
    NULL
  ),
  (
    'u_698dacf7dd609',
    'k4o1mhcbqja',
    'user',
    'hi',
    1770892537,
    NULL
  ),
  (
    'u_698dad2e90a97',
    'k4o1mhcbqja',
    'user',
    'who is the dean of the school?',
    1770892590,
    NULL
  ),
  (
    'u_698dad8a9a893',
    'k4o1mhcbqja',
    'user',
    'what is  Lampara?',
    1770892682,
    NULL
  ),
  (
    'u_698f1adc1a0fa',
    'vcwctr9tyf',
    'user',
    'Hi Kumusta po Magandang Tnaghali po at Happy Valentines Day',
    1770986204,
    NULL
  ),
  (
    'u_698f1f7d9b498',
    '0g4g0r3zi4k',
    'user',
    'what are the requirement for the freshmen?',
    1770987389,
    NULL
  ),
  (
    'u_698f1ff026a7f',
    '0g4g0r3zi4k',
    'user',
    'what are the cources for college?',
    1770987504,
    NULL
  ),
  (
    'u_698f202edba03',
    '0g4g0r3zi4k',
    'user',
    'ok thats all thank for the info have a great day and HVD!',
    1770987566,
    NULL
  ),
  (
    'u_698f2750d0de3',
    '12gp0dmcck1g',
    'user',
    'naimbag a bigat kinyam sapay kuma ta mayat alaldaw mo',
    1770989392,
    NULL
  ),
  (
    'u_698f279c8592c',
    '12gp0dmcck1g',
    'user',
    'ayaong adlaw sa nimong tanan',
    1770989468,
    NULL
  ),
  (
    'u_698f285912d41',
    '1jwrw3bpghp',
    'user',
    'Salamat ta igwa akong ikaw sa buhay ko.',
    1770989657,
    NULL
  ),
  (
    'u_698f2863f1913',
    'tfwel5t3t9j',
    'user',
    'Salamat ta igwa akong ikaw sa buhay ko.',
    1770989667,
    NULL
  ),
  (
    'u_698f2881ac605',
    'tfwel5t3t9j',
    'user',
    'hindi ko maintindihan paki bicol naman yan',
    1770989697,
    NULL
  ),
  (
    'u_6997344d06e83',
    'y7lucfuzsuh',
    'user',
    'HI',
    1771517005,
    NULL
  ),
  (
    'u_69980dc3e1023',
    'y7lucfuzsuh',
    'user',
    'hi there',
    1771572675,
    NULL
  ),
  (
    'u_69980df9c10ea',
    'y7lucfuzsuh',
    'user',
    'what are the requirement for the upcoming freshmen?',
    1771572734,
    NULL
  ),
  (
    'v0xgxkyq4c9',
    'ax5i8byb0lh',
    'model',
    'We offer several scholarships including Entrance Scholarships for honor students, Athletic Scholarships, and the ESC Grant for Junior High School. You can apply at the Guidance Office.',
    1771048085838,
    NULL
  ),
  (
    'y5evx2js3ne',
    '3f22ri4h84e',
    'user',
    'what is the Lampara?',
    1770890364825,
    NULL
  ),
  (
    'ycngfikw1h',
    '12gp0dmcck1g',
    'user',
    'How do I enroll?',
    1771048548047,
    NULL
  );
-- --------------------------------------------------------
--
-- Table structure for table `settings`
--
CREATE TABLE `settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `system_name` varchar(255) DEFAULT 'CCC SmartAssist',
  `theme_color` varchar(50) DEFAULT 'blue',
  `api_key` text DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `settings`
--
INSERT INTO `settings` (`id`, `system_name`, `theme_color`, `api_key`)
VALUES (
    1,
    'CCCBotAI',
    'blue',
    'AIzaSyCZMrCxQwaeAoKGWTbD9d-s_WX5pPM1EEo'
  );
-- --------------------------------------------------------
--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student', 'admin') NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `year_level` varchar(20) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `users`
--
INSERT INTO `users` (
    `id`,
    `username`,
    `password`,
    `role`,
    `full_name`,
    `email`,
    `student_id`,
    `course`,
    `year_level`
  )
VALUES (
    'admin-01',
    'admin',
    '$2y$10$/8j1UG8T3Lz3plYB61CkJ.Hd0l9sq2.iMH6cVgqa2Ifjk8i891BcW',
    'admin',
    'System Administrator',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'student-698daf35e7c3e',
    'CIndy',
    '$2y$10$Qqd7LFskpH2/1qByxaPuO.q97jNR3Dq.lrCi67U5OYecU5nwWb1MK',
    'student',
    'Cindy Magbanua',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'student-698f1a8bc9fc0',
    'She',
    '$2y$10$ALmGx8UWPvzeS0Gnu5tKfO4RLu82VyItTA.PcvJ/UYunvugPgjfxS',
    'student',
    'Sheryn Al Hamadi',
    'sherynalhamadi.87@gmail.com',
    '2023-03200',
    'BS Informatin Technology',
    '4th Year'
  );
--
-- Indexes for dumped tables
--
--
-- Indexes for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `faq_questions`
--
ALTER TABLE `faq_questions`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `knowledge_base`
--
ALTER TABLE `knowledge_base`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `manual_rules`
--
ALTER TABLE `manual_rules`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);
--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `users`
--
ALTER TABLE `users`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);
--
-- Constraints for dumped tables
--
--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE;
COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;