-- MySQL dump 10.13  Distrib 5.6.13, for Win32 (x86)
--
-- Host: localhost    Database: hospital
-- ------------------------------------------------------
-- Server version	5.7.17-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hospital_id` int(11) NOT NULL,
  `name` varchar(30) DEFAULT NULL,
  `doctorscol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hospital_id` (`hospital_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,1,'김개똥',NULL),(2,1,'김전화',NULL);
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `family`
--

DROP TABLE IF EXISTS `family`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `family` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `family`
--

LOCK TABLES `family` WRITE;
/*!40000 ALTER TABLE `family` DISABLE KEYS */;
INSERT INTO `family` VALUES (1,1,'김개똥'),(2,1,'김멍멍');
/*!40000 ALTER TABLE `family` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospital`
--

DROP TABLE IF EXISTS `hospital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hospital` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) DEFAULT NULL,
  `dong` varchar(50) DEFAULT NULL,
  `addr` varchar(100) DEFAULT NULL,
  `tel` varchar(30) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `homepage` varchar(30) DEFAULT NULL,
  `notice` varchar(150) DEFAULT NULL,
  `isUse` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospital`
--

LOCK TABLES `hospital` WRITE;
/*!40000 ALTER TABLE `hospital` DISABLE KEYS */;
INSERT INTO `hospital` VALUES (1,'마곡백병원','마곡동',NULL,NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `hospital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserve`
--

DROP TABLE IF EXISTS `reserve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reserve` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hospital_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `family_id` int(11) DEFAULT NULL,
  `doctor_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hospital_id_2` (`hospital_id`,`doctor_id`,`date`,`time_id`),
  UNIQUE KEY `hospital_id` (`hospital_id`,`user_id`,`family_id`,`doctor_id`,`date`,`time_id`),
  KEY `user_id` (`user_id`),
  KEY `time_id` (`time_id`),
  KEY `family_id` (`family_id`),
  CONSTRAINT `reserve_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`id`),
  CONSTRAINT `reserve_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `reserve_ibfk_3` FOREIGN KEY (`time_id`) REFERENCES `times` (`id`),
  CONSTRAINT `reserve_ibfk_4` FOREIGN KEY (`family_id`) REFERENCES `family` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserve`
--

LOCK TABLES `reserve` WRITE;
/*!40000 ALTER TABLE `reserve` DISABLE KEYS */;
/*!40000 ALTER TABLE `reserve` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('LErkvvipfjErdAwkTKaFDBqyYM_CGEka',1526521225,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"passport\":{}}'),('fxKzOOI0_QfwzX7Hx6BXwkFlMe62wmxY',1526461779,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"passport\":{}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sido`
--

DROP TABLE IF EXISTS `sido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sido` (
  `id` int(11) NOT NULL,
  `sidoCode` varchar(4) DEFAULT NULL,
  `sidoName` varchar(45) DEFAULT NULL,
  `gunguCode` varchar(10) DEFAULT NULL,
  `gunguName` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='시군구 코드 정보가 들어있음';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sido`
--

LOCK TABLES `sido` WRITE;
/*!40000 ALTER TABLE `sido` DISABLE KEYS */;
INSERT INTO `sido` VALUES (1,'11','서울특별시','110001','강남구'),(2,'11','서울특별시','110002','강동구'),(3,'11','서울특별시','110003','강서구'),(4,'11','서울특별시','110004','관악구'),(5,'11','서울특별시','110005','구로구'),(6,'11','서울특별시','110006','도봉구'),(7,'11','서울특별시','110007','동대문구'),(8,'11','서울특별시','110008','동작구'),(9,'11','서울특별시','110009','마포구'),(10,'11','서울특별시','110010','서대문구'),(11,'11','서울특별시','110011','성동구'),(12,'11','서울특별시','110012','성북구'),(13,'11','서울특별시','110013','영등포구'),(14,'11','서울특별시','110014','용산구'),(15,'11','서울특별시','110015','은평구'),(16,'11','서울특별시','110016','종로구'),(17,'11','서울특별시','110017','중구'),(18,'11','서울특별시','110018','송파구'),(19,'11','서울특별시','110019','중랑구'),(20,'11','서울특별시','110020','양천구'),(21,'11','서울특별시','110021','서초구'),(22,'11','서울특별시','110022','노원구'),(23,'11','서울특별시','110023','광진구'),(24,'11','서울특별시','110024','강북구'),(25,'11','서울특별시','110025','금천구'),(26,'21','부산광역시','210001','남구'),(27,'21','부산광역시','210002','동구'),(28,'21','부산광역시','210003','동래구'),(29,'21','부산광역시','210004','진구'),(30,'21','부산광역시','210005','북구'),(31,'21','부산광역시','210006','서구'),(32,'21','부산광역시','210007','영도구'),(33,'21','부산광역시','210008','중구'),(34,'21','부산광역시','210009','해운대구'),(35,'21','부산광역시','210010','사하구'),(36,'21','부산광역시','210011','금정구'),(37,'21','부산광역시','210012','강서구'),(38,'21','부산광역시','210013','연제구'),(39,'21','부산광역시','210014','수영구'),(40,'21','부산광역시','210015','사상구'),(41,'21','부산광역시','210100','기장군'),(42,'22','인천광역시','220001','남구'),(43,'22','인천광역시','220002','동구'),(44,'22','인천광역시','220003','부평구'),(45,'22','인천광역시','220004','중구'),(46,'22','인천광역시','220005','서구'),(47,'22','인천광역시','220006','남동구'),(48,'22','인천광역시','220007','연수구'),(49,'22','인천광역시','220008','계양구'),(50,'22','인천광역시','220100','강화군'),(51,'22','인천광역시','220200','옹진군'),(52,'23','대구광역시','230001','남구'),(53,'23','대구광역시','230002','동구'),(54,'23','대구광역시','230003','북구'),(55,'23','대구광역시','230004','서구'),(56,'23','대구광역시','230005','수성구'),(57,'23','대구광역시','230006','중구'),(58,'23','대구광역시','230007','달서구'),(59,'23','대구광역시','230100','달성군'),(60,'24','광주광역시','240001','동구'),(61,'24','광주광역시','240002','북구'),(62,'24','광주광역시','240003','서구'),(63,'24','광주광역시','240004','광산구'),(64,'24','광주광역시','240005','남구'),(65,'25','대전광역시','250001','유성구'),(66,'25','대전광역시','250002','대덕구'),(67,'25','대전광역시','250003','서구'),(68,'25','대전광역시','250004','동구'),(69,'25','대전광역시','250005','중구'),(70,'26','울산광역시','260001','남구'),(71,'26','울산광역시','260002','동구'),(72,'26','울산광역시','260003','중구'),(73,'26','울산광역시','260004','북구'),(74,'26','울산광역시','260100','울주군'),(75,'31','경기도','310001','가평군'),(76,'31','경기도','310002','강화군'),(77,'31','경기도','310006','시흥시'),(78,'31','경기도','310008','양주군'),(79,'31','경기도','310009','양평군'),(80,'31','경기도','310010','여주군'),(81,'31','경기도','310011','연천군'),(82,'31','경기도','310012','옹진군'),(83,'31','경기도','310016','평택군'),(84,'31','경기도','310017','포천군'),(85,'31','경기도','310100','광명시'),(86,'31','경기도','310200','동두천시'),(87,'31','경기도','310301','부천소사구'),(88,'31','경기도','310302','부천오정구'),(89,'31','경기도','310303','부천원미구'),(90,'31','경기도','310401','성남수정구'),(91,'31','경기도','310402','성남중원구'),(92,'31','경기도','310403','성남분당구'),(93,'31','경기도','310500','송탄시'),(94,'31','경기도','310601','수원권선구'),(95,'31','경기도','310602','수원장안구'),(96,'31','경기도','310603','수원팔달구'),(97,'31','경기도','310604','수원영통구'),(98,'31','경기도','310701','안양만안구'),(99,'31','경기도','310702','안양동안구'),(100,'31','경기도','310800','의정부시'),(101,'31','경기도','310900','과천시'),(102,'31','경기도','311000','구리시'),(103,'31','경기도','311101','안산단원구'),(104,'31','경기도','311102','안산상록구'),(105,'31','경기도','311200','평택시'),(106,'31','경기도','311300','하남시'),(107,'31','경기도','311400','군포시'),(108,'31','경기도','311500','남양주시'),(109,'31','경기도','311600','의왕시'),(110,'31','경기도','311700','시흥시'),(111,'31','경기도','311800','오산시'),(112,'31','경기도','311901','고양덕양구'),(113,'31','경기도','311902','고양일산서구'),(114,'31','경기도','311903','고양일산동구'),(115,'31','경기도','312001','용인기흥구'),(116,'31','경기도','312002','용인수지구'),(117,'31','경기도','312003','용인처인구'),(118,'31','경기도','312100','이천시'),(119,'31','경기도','312200','파주시'),(120,'31','경기도','312300','김포시'),(121,'31','경기도','312400','안성시'),(122,'31','경기도','312500','화성시'),(123,'31','경기도','312600','광주시'),(124,'31','경기도','312700','양주시'),(125,'31','경기도','312800','포천시'),(126,'31','경기도','312900','여주시'),(127,'32','강원도','320001','고성군'),(128,'32','강원도','320004','양구군'),(129,'32','강원도','320005','양양군'),(130,'32','강원도','320006','영월군'),(131,'32','강원도','320008','인제군'),(132,'32','강원도','320009','정선군'),(133,'32','강원도','320010','철원군'),(134,'32','강원도','320012','평창군'),(135,'32','강원도','320013','홍천군'),(136,'32','강원도','320014','화천군'),(137,'32','강원도','320015','횡성군'),(138,'32','강원도','320100','강릉시'),(139,'32','강원도','320200','동해시'),(140,'32','강원도','320300','속초시'),(141,'32','강원도','320400','원주시'),(142,'32','강원도','320500','춘천시'),(143,'32','강원도','320600','태백시'),(144,'32','강원도','320700','삼척시'),(145,'33','충청북도','330001','괴산군'),(146,'33','충청북도','330002','단양군'),(147,'33','충청북도','330003','보은군'),(148,'33','충청북도','330004','영동군'),(149,'33','충청북도','330005','옥천군'),(150,'33','충청북도','330006','음성군'),(151,'33','충청북도','330007','제천군'),(152,'33','충청북도','330009','진천군'),(153,'33','충청북도','330010','청원군'),(154,'33','충청북도','330011','증평군'),(155,'33','충청북도','330101','청주상당구'),(156,'33','충청북도','330102','청주흥덕구'),(157,'33','충청북도','330103','청주청원구'),(158,'33','충청북도','330104','청주서원구'),(159,'33','충청북도','330200','충주시'),(160,'33','충청북도','330300','제천시'),(161,'34','충청남도','340002','금산군'),(162,'34','충청남도','340004','당진군'),(163,'34','충청남도','340007','부여군'),(164,'34','충청남도','340009','서천군'),(165,'34','충청남도','340011','연기군'),(166,'34','충청남도','340012','예산군'),(167,'34','충청남도','340013','천안군'),(168,'34','충청남도','340014','청양군'),(169,'34','충청남도','340015','홍성군'),(170,'34','충청남도','340016','태안군'),(171,'34','충청남도','340201','천안서북구'),(172,'34','충청남도','340202','천안동남구'),(173,'34','충청남도','340300','공주시'),(174,'34','충청남도','340400','보령시'),(175,'34','충청남도','340500','아산시'),(176,'34','충청남도','340600','서산시'),(177,'34','충청남도','340700','논산시'),(178,'34','충청남도','340800','계룡시'),(179,'34','충청남도','340900','당진시'),(180,'35','전라북도','350001','고창군'),(181,'35','전라북도','350004','무주군'),(182,'35','전라북도','350005','부안군'),(183,'35','전라북도','350006','순창군'),(184,'35','전라북도','350008','완주군'),(185,'35','전라북도','350009','익산군'),(186,'35','전라북도','350010','임실군'),(187,'35','전라북도','350011','장수군'),(188,'35','전라북도','350013','진안군'),(189,'35','전라북도','350100','군산시'),(190,'35','전라북도','350200','남원시'),(191,'35','전라북도','350300','익산시'),(192,'35','전라북도','350401','전주완산구'),(193,'35','전라북도','350402','전주덕진구'),(194,'35','전라북도','350500','정읍시'),(195,'35','전라북도','350600','김제시'),(196,'36','전라남도','360001','강진군'),(197,'36','전라남도','360002','고흥군'),(198,'36','전라남도','360003','곡성군'),(199,'36','전라남도','360006','구례군'),(200,'36','전라남도','360008','담양군'),(201,'36','전라남도','360009','무안군'),(202,'36','전라남도','360010','보성군'),(203,'36','전라남도','360012','신안군'),(204,'36','전라남도','360014','영광군'),(205,'36','전라남도','360015','영암군'),(206,'36','전라남도','360016','완도군'),(207,'36','전라남도','360017','장성군'),(208,'36','전라남도','360018','장흥군'),(209,'36','전라남도','360019','진도군'),(210,'36','전라남도','360020','함평군'),(211,'36','전라남도','360021','해남군'),(212,'36','전라남도','360022','화순군'),(213,'36','전라남도','360200','나주시'),(214,'36','전라남도','360300','목포시'),(215,'36','전라남도','360400','순천시'),(216,'36','전라남도','360500','여수시'),(217,'36','전라남도','360700','광양시'),(218,'37','경상북도','370002','고령군'),(219,'37','경상북도','370003','군위군'),(220,'37','경상북도','370005','달성군'),(221,'37','경상북도','370007','봉화군'),(222,'37','경상북도','370010','성주군'),(223,'37','경상북도','370012','영덕군'),(224,'37','경상북도','370013','영양군'),(225,'37','경상북도','370014','영일군'),(226,'37','경상북도','370017','예천군'),(227,'37','경상북도','370018','울릉군'),(228,'37','경상북도','370019','울진군'),(229,'37','경상북도','370021','의성군'),(230,'37','경상북도','370022','청도군'),(231,'37','경상북도','370023','청송군'),(232,'37','경상북도','370024','칠곡군'),(233,'37','경상북도','370100','경주시'),(234,'37','경상북도','370200','구미시'),(235,'37','경상북도','370300','김천시'),(236,'37','경상북도','370400','안동시'),(237,'37','경상북도','370500','영주시'),(238,'37','경상북도','370600','영천시'),(239,'37','경상북도','370701','포항남구'),(240,'37','경상북도','370702','포항북구'),(241,'37','경상북도','370800','문경시'),(242,'37','경상북도','370900','상주시'),(243,'37','경상북도','371000','경산시'),(244,'38','경상남도','380002','거창군'),(245,'38','경상남도','380003','고성군'),(246,'38','경상남도','380004','김해군'),(247,'38','경상남도','380005','남해군'),(248,'38','경상남도','380007','사천군'),(249,'38','경상남도','380008','산청군'),(250,'38','경상남도','380011','의령군'),(251,'38','경상남도','380012','창원군'),(252,'38','경상남도','380014','창녕군'),(253,'38','경상남도','380016','하동군'),(254,'38','경상남도','380017','함안군'),(255,'38','경상남도','380018','함양군'),(256,'38','경상남도','380019','합천군'),(257,'38','경상남도','380100','김해시'),(258,'38','경상남도','380200','마산시'),(259,'38','경상남도','380300','사천시'),(260,'38','경상남도','380500','진주시'),(261,'38','경상남도','380600','진해시'),(262,'38','경상남도','380701','창원마산회원구'),(263,'38','경상남도','380702','창원마산합포구'),(264,'38','경상남도','380703','창원진해구'),(265,'38','경상남도','380704','창원의창구'),(266,'38','경상남도','380705','창원성산구'),(267,'38','경상남도','380800','통영시'),(268,'38','경상남도','380900','밀양시'),(269,'38','경상남도','381000','거제시'),(270,'38','경상남도','381100','양산시'),(271,'39','제주특별자치도','390001','남제주군'),(272,'39','제주특별자치도','390002','북제주군'),(273,'39','제주특별자치도','390100','서귀포시'),(274,'39','제주특별자치도','390200','제주시'),(275,'41','세종특별자치시','410000','세종시');
/*!40000 ALTER TABLE `sido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subject` (
  `code` varchar(3) NOT NULL,
  `subject` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='진료과목';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
/*!40000 ALTER TABLE `subject` DISABLE KEYS */;
INSERT INTO `subject` VALUES ('00','일반의'),('01','내과'),('02','신경과'),('03','정신건강의학과'),('04','외');
/*!40000 ALTER TABLE `subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `times`
--

DROP TABLE IF EXISTS `times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `times` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hospital_id` int(11) NOT NULL,
  `time` time NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hospital_id_2` (`hospital_id`,`time`),
  KEY `hospital_id` (`hospital_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `times`
--

LOCK TABLES `times` WRITE;
/*!40000 ALTER TABLE `times` DISABLE KEYS */;
INSERT INTO `times` VALUES (1,1,'09:00:00'),(2,1,'09:10:00'),(3,1,'09:30:00'),(4,1,'09:40:00');
/*!40000 ALTER TABLE `times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `uid` int(20) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(20) NOT NULL,
  `uname` varchar(20) NOT NULL,
  `upwd` varchar(50) NOT NULL,
  `uphone` varchar(20) DEFAULT NULL,
  `ucreate` varchar(30) DEFAULT NULL,
  `upoint` int(30) DEFAULT NULL,
  `isUse` int(5) DEFAULT NULL,
  `utwhy` int(5) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (6,'abc','1234','1234','010-123-1234',NULL,NULL,NULL,NULL),(7,'aaaa@naver.com','1234','1234','010-123-1234',NULL,NULL,NULL,NULL),(8,'aaa','1234','1234','010-123-1234',NULL,NULL,NULL,NULL),(9,'aaaaa','1234','1234','010-123-1234',NULL,NULL,NULL,NULL),(10,'fdfd','1234','12345','010-123-1234',NULL,NULL,NULL,NULL),(11,'afdsfdsf','1234','1234','010-123-1234',NULL,NULL,NULL,NULL),(12,'111','1234','1234','010-123-1234',NULL,NULL,NULL,NULL),(13,'pp','pp','1234','010-123-1234',NULL,NULL,NULL,NULL),(14,'aa','aa','1234','010-123-1234',NULL,NULL,NULL,NULL),(15,'ss','ss','ss','010-123-1234',NULL,NULL,NULL,NULL),(16,'qq','qq','qq','010-123-1234',NULL,NULL,NULL,NULL),(17,'qa','qa','qa','010-123-1234',NULL,NULL,NULL,NULL),(18,'ff','ff','ff','010-123-1234',NULL,NULL,NULL,NULL),(19,'gg','gg','gg','010-123-1234',NULL,NULL,NULL,NULL),(20,'qw','qw','qw','010-123-1234',NULL,NULL,NULL,NULL),(21,'1q','1q','1q','010-123-1234',NULL,NULL,NULL,NULL),(22,'1q2w','1q2w','1q2w','010-123-1234',NULL,NULL,NULL,NULL),(23,'1q2','1q2','1q2','010-123-1234',NULL,NULL,NULL,NULL),(24,'yoonhanl@naver.com','윤하늘','1234','010-123-1234',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-16 10:53:24
