import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontFamily: 'Helvetica',
    display: 'flex',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 10,
    paddingBottom: 30,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
  },
  text: {
    lineHeight: 1.4,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  h1: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    paddingVertical: 20,
  },
  h2: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    paddingVertical: 10,
  },
  h3: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    paddingVertical: 5,
  },
  pageNumbers: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 5,
    paddingBottom: 2,
  },
  bullet: {
    marginTop: 6,
  },
});
