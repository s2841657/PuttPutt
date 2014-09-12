/*                                                                -*- C -*-
   +----------------------------------------------------------------------+
   | PHP Version 5                                                        |
   +----------------------------------------------------------------------+
   | Copyright (c) 1997-2007 The PHP Group                                |
   +----------------------------------------------------------------------+
   | This source file is subject to version 3.01 of the PHP license,      |
   | that is bundled with this package in the file LICENSE, and is        |
   | available through the world-wide-web at the following url:           |
   | http://www.php.net/license/3_01.txt                                  |
   | If you did not receive a copy of the PHP license and are unable to   |
   | obtain it through the world-wide-web, please send a note to          |
   | license@php.net so we can mail you a copy immediately.               |
   +----------------------------------------------------------------------+
   | Author: Stig Sæther Bakken <ssb@php.net>                             |
   +----------------------------------------------------------------------+
*/

/* $Id$ */

#define CONFIGURE_COMMAND " './configure'  '--with-apxs2=/home/action/.parts/packages/apache2/2.4.7-nitrous1/bin/apxs' '--with-mcrypt=/home/action/.parts/packages/libmcrypt/2.5.8' '--prefix=/home/action/.parts/packages/php5/5.5.11' '--bindir=/home/action/.parts/packages/php5/5.5.11/bin' '--sbindir=/home/action/.parts/packages/php5/5.5.11/bin' '--with-config-file-path=/home/action/.parts/etc/php5/php.ini' '--sysconfdir=/home/action/.parts/etc/php5' '--libdir=/home/action/.parts/packages/php5/5.5.11/lib' '--includedir=/home/action/.parts/packages/php5/5.5.11/include' '--datarootdir=/home/action/.parts/packages/php5/5.5.11/share/php5' '--datadir=/home/action/.parts/packages/php5/5.5.11/share/php5' '--mandir=/home/action/.parts/packages/php5/5.5.11/share/man' '--docdir=/home/action/.parts/packages/php5/5.5.11/share/doc/php5' '--enable-opcache' '--with-mysql=mysqlnd' '--with-mysqli=mysqlnd' '--with-pdo-mysql=mysqlnd' '--with-mysql-sock=/tmp/mysql.sock' '--with-openssl' '--with-pgsql' '--with-pdo-pgsql' '--with-readline' '--with-gd' '--with-jpeg-dir=/usr/lib/x86_64-linux-gnu' '--with-curl' '--enable-zip' '--with-zlib' '--with-iconv' '--enable-mbstring' '--enable-soap' '--enable-bcmath' '--enable-intl'"
#define PHP_ADA_INCLUDE		""
#define PHP_ADA_LFLAGS		""
#define PHP_ADA_LIBS		""
#define PHP_APACHE_INCLUDE	""
#define PHP_APACHE_TARGET	""
#define PHP_FHTTPD_INCLUDE      ""
#define PHP_FHTTPD_LIB          ""
#define PHP_FHTTPD_TARGET       ""
#define PHP_CFLAGS		"$(CFLAGS_CLEAN) "
#define PHP_DBASE_LIB		""
#define PHP_BUILD_DEBUG		""
#define PHP_GDBM_INCLUDE	""
#define PHP_IBASE_INCLUDE	""
#define PHP_IBASE_LFLAGS	""
#define PHP_IBASE_LIBS		""
#define PHP_IFX_INCLUDE		""
#define PHP_IFX_LFLAGS		""
#define PHP_IFX_LIBS		""
#define PHP_INSTALL_IT		"$(mkinstalldirs) '$(INSTALL_ROOT)/home/action/.parts/packages/apache2/2.4.7-nitrous1/modules' &&                 $(mkinstalldirs) '$(INSTALL_ROOT)/home/action/.parts/etc/apache2' &&                  /home/action/.parts/packages/apache2/2.4.7-nitrous1/bin/apxs -S LIBEXECDIR='$(INSTALL_ROOT)/home/action/.parts/packages/apache2/2.4.7-nitrous1/modules'                        -S SYSCONFDIR='$(INSTALL_ROOT)/home/action/.parts/etc/apache2'                        -i -a -n php5 libphp5.la"
#define PHP_IODBC_INCLUDE	""
#define PHP_IODBC_LFLAGS	""
#define PHP_IODBC_LIBS		""
#define PHP_MSQL_INCLUDE	""
#define PHP_MSQL_LFLAGS		""
#define PHP_MSQL_LIBS		""
#define PHP_MYSQL_INCLUDE	""
#define PHP_MYSQL_LIBS		""
#define PHP_MYSQL_TYPE		""
#define PHP_ODBC_INCLUDE	""
#define PHP_ODBC_LFLAGS		""
#define PHP_ODBC_LIBS		""
#define PHP_ODBC_TYPE		""
#define PHP_OCI8_SHARED_LIBADD 	""
#define PHP_OCI8_DIR			""
#define PHP_OCI8_ORACLE_VERSION		""
#define PHP_ORACLE_SHARED_LIBADD 	"@ORACLE_SHARED_LIBADD@"
#define PHP_ORACLE_DIR				"@ORACLE_DIR@"
#define PHP_ORACLE_VERSION			"@ORACLE_VERSION@"
#define PHP_PGSQL_INCLUDE	""
#define PHP_PGSQL_LFLAGS	""
#define PHP_PGSQL_LIBS		""
#define PHP_PROG_SENDMAIL	""
#define PHP_SOLID_INCLUDE	""
#define PHP_SOLID_LIBS		""
#define PHP_EMPRESS_INCLUDE	""
#define PHP_EMPRESS_LIBS	""
#define PHP_SYBASE_INCLUDE	""
#define PHP_SYBASE_LFLAGS	""
#define PHP_SYBASE_LIBS		""
#define PHP_DBM_TYPE		""
#define PHP_DBM_LIB		""
#define PHP_LDAP_LFLAGS		""
#define PHP_LDAP_INCLUDE	""
#define PHP_LDAP_LIBS		""
#define PHP_BIRDSTEP_INCLUDE     ""
#define PHP_BIRDSTEP_LIBS        ""
#define PEAR_INSTALLDIR         "/home/action/.parts/packages/php5/5.5.11/lib/php"
#define PHP_INCLUDE_PATH	".:/home/action/.parts/packages/php5/5.5.11/lib/php"
#define PHP_EXTENSION_DIR       "/home/action/.parts/packages/php5/5.5.11/lib/extensions/no-debug-zts-20121212"
#define PHP_PREFIX              "/home/action/.parts/packages/php5/5.5.11"
#define PHP_BINDIR              "/home/action/.parts/packages/php5/5.5.11/bin"
#define PHP_SBINDIR             "/home/action/.parts/packages/php5/5.5.11/bin"
#define PHP_MANDIR              "/home/action/.parts/packages/php5/5.5.11/share/man"
#define PHP_LIBDIR              "/home/action/.parts/packages/php5/5.5.11/lib"
#define PHP_DATADIR             "/home/action/.parts/packages/php5/5.5.11/share/php5"
#define PHP_SYSCONFDIR          "/home/action/.parts/etc/php5"
#define PHP_LOCALSTATEDIR       "/home/action/.parts/packages/php5/5.5.11/var"
#define PHP_CONFIG_FILE_PATH    "/home/action/.parts/etc/php5/php.ini"
#define PHP_CONFIG_FILE_SCAN_DIR    ""
#define PHP_SHLIB_SUFFIX        "so"
