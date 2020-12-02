function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Experimenter settings</Text>}>
        <Button
			label="Download data"
				  onClick={() => {
			props.settingsStorage.clear();
            props.settingsStorage.setItem('download', 'true');
          }}
		  />
		  <Button
			label="Delete data from memory"
				  onClick={() => {
			props.settingsStorage.clear();
            props.settingsStorage.setItem('delete', 'true');
          }}
			/>

      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);