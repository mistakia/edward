SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;

CREATE TABLE `accounts` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(100) DEFAULT NULL,
  `custody` varchar(100) DEFAULT NULL,
  `userId` varchar(100) NOT NULL,
  `type` int(1) NOT NULL,
  PRIMARY KEY `uid` (`uid`),
  UNIQUE KEY `user` (`userId`,`type`),
  UNIQUE KEY `custody` (`custody`),
  KEY `userId` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `uid` int(11) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `address` varchar(100) NOT NULL,
  `amount` varchar(35) NOT NULL,
  `type` int(1) NOT NULL,
  `timestamp` int(11) DEFAULT NULL,
  KEY `uid` (`uid`),
  KEY `address` (`address`),
  UNIQUE KEY `hash` (`hash`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
